import { Router } from "express"
import type { FightError, FightMapID, FightResult, PlayingTeamID, Result, TeamMemberData } from "@reflexer/engine"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { UserModel } from "@models/user.model"
import { NotificationModel } from "@models/notification.model"
import { buildTeamFromUserId } from "@services/team.service"
import { engine } from "../.."
 
const router = Router()

router.post("/", async (req, res) => {
    try {
        const { playerId } = req.body as { playerId: string }
        const playerUser = await UserModel.findById(playerId, { name: 1 })
        if (! playerUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        // TODO: trouver adversaire avec elo similaire
        const opponentId = "000000000000000000000001"
        const opponentUser = await UserModel.findById(opponentId, { name: 1 })
        if (! opponentUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        // TODO: carte alétoire
        const fightMapId = "TRAINING_GROUND"

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
            mode: "RANKED",
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
            initialState: result.value.initialState,
            logs: result.value.logs
        })

        // calculer montée et baisse de elo pour gagnant, perdant

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
            opponentUser,
            // TODO: données de ranked
        })

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})
 
export default router
