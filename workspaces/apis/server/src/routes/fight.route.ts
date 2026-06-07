import { Router } from "express"
import type { FightError, FightMapID, FightResult, Result, TeamMemberData } from "@reflexer/engine"
import { FightLogModel } from "@models/fight_log.model"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { engine } from "../index"
import { buildTeamFromUserId } from "../services/team.service"
 
const router = Router()

router.post("/friendly", async (req, res) => {
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

        const fightWinnerTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"

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
            winner: fightWinnerTeamID,
            endState: result.value.endState,
            fightMapId
        })

        await FightLogModel.create({
            fightId: fight._id,
            fightType: "PVP",
            logs: result.value.logs
        })

        res.status(201).json(fight)

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})
 
export default router
