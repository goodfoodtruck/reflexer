import { Router } from "express"
import type { FightError, FightMapID, FightResult, PlayingTeamID, Result, TeamMemberData } from "@reflexer/engine"
import { FightLogModel } from "@models/fight_log.model"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { UserModel } from "@models/user.model"
import { NotificationModel } from "@models/notification.model"
import { buildTeamFromUserId } from "@services/team.service"
import { engine } from "../.."
 
const router = Router()

router.post("/", async (req, res) => {
    try {
        const { playerId, opponentId, fightMapId } = req.body as {
            playerId: string
            opponentId: string
            fightMapId: FightMapID
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
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            opponentTeam: opponentTeam.map((teamMember: TeamMemberData) => ({
                characterName: teamMember.characterName,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            winnerId,
            endState: result.value.endState,
            initialState: result.value.initialState
        })

        await FightLogModel.create({
            fightId: fight._id,
            logs: result.value.logs
        })

        // Notifier l'adversaire
        const playerUser = await UserModel.findById(playerId, { name: 1 });
        if (playerUser) {
            await NotificationModel.create({
                userId: opponentId,
                fromName: playerUser.name,
                fightId: fight._id,
                winner: winnerTeamID
            });
        }

        res.status(201).json({
            ...fight.toObject(),
            initialState: result.value.initialState,
            logs:         result.value.logs,
        })

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})
 
export default router
