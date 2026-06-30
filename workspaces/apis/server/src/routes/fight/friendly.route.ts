import { Router, Request, Response, NextFunction } from "express"
import type { FightError, FightMapID, FightResult, PlayingTeamID, Result, TeamMemberData } from "@reflexer/engine"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { UserModel } from "@models/user.model"
import { NotificationModel } from "@models/notification.model"
import { buildTeamFromUserId } from "@services/team.service"
import { engine } from "../.."
 
const router = Router()

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerId, opponentId, fightMapId } = req.body as {
            playerId: string
            opponentId: string
            fightMapId: FightMapID
        }

        const [playerUser, opponentUser] = await Promise.all([
            UserModel.findById(playerId, { name: 1 }),
            UserModel.findById(opponentId, { name: 1 })
        ])

        if (! playerUser || ! opponentUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        const playerTeam   = await buildTeamFromUserId(playerId)
        const opponentTeam = await buildTeamFromUserId(opponentId)

        if (! playerTeam.length || ! opponentTeam.length) {
            res.status(400).json({ error: "TEAM_EMPTY" })
            return
        }

        const result: Result<FightResult, FightError> = engine.playPvpFight(fightMapId, playerTeam, opponentTeam)

        if (! result.success) {
            res.status(400).json({ error: result.reason })
            return
        }

        const winnerId = result.value.endState.kind === "WON" ? playerId : opponentId
        const winnerTeamID: PlayingTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"

        const fight = await PvpFightModel.create({
            mode: "FRIENDLY",
            playerUserId: playerId,
            opponentUserId: opponentId,
            playerTeam: playerTeam.map((teamMember: TeamMemberData) => ({
                characterName: teamMember.characterName,
                characterTag: teamMember.characterTag,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            opponentTeam: opponentTeam.map((teamMember: TeamMemberData) => ({
                characterName: teamMember.characterName,
                characterTag: teamMember.characterTag,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            winnerId,
            endState: result.value.endState,
            initialState: result.value.initialState,
            logs: result.value.logs
        })

        // Notifier l'adversaire
        await NotificationModel.create({
            userId: opponentId,
            fromName: playerUser.name,
            fightId: fight._id,
            winner: winnerTeamID
        });
        
        res.status(201).json({
            ...fight.toObject(),
            playerUser,
            opponentUser
        })

    } catch (error) {
        next(error)
    }
})
 
export default router
