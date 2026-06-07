import { Router } from "express"
import type { FightError, FightMapID, FightResult, Result, TeamMemberData } from "@reflexer/engine"
import { FightLogModel } from "@models/fight_log.model"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { engine } from "../index"
 
const router = Router()

router.post("/friendly", async (req, res) => {
    try {
        const { playerId, opponentId, fightMapId, playerTeam, opponentTeam } = req.body as {
            playerId: string,
            opponentId: string,
            fightMapId: FightMapID, 
            playerTeam: TeamMemberData[], 
            opponentTeam: TeamMemberData[]
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
                name: teamMember.name,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            opponentTeam: opponentTeam.map((teamMember: TeamMemberData) => ({
                name: teamMember.name,
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
