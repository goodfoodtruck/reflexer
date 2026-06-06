import { Router } from "express"
import type { EnemyName, TurnLog, FightEndState } from "@reflexer/engine"
import { FightModel } from "../models/fight.model"
import { FightLogModel } from "../models/fight_log.model"
 
const router = Router()
 
router.post("/", async (req, res) => {
    try {
        const { runId, enemies, floorIndex } = req.body as {
            runId:      string
            enemies:    EnemyName[]
            floorIndex: number
        }
        const fight = await FightModel.create({ runId, enemies, floorIndex })
        res.status(201).json(fight)
    } catch (error) {
        res.status(400).json({ error: "Unable to create fight", details: error })
    }
})
 
// Récupérer tous les combats d'une run
router.get("/", async (req, res) => {
    const { runId } = req.query
    if (! runId) return res.status(400).json({ error: "runId is required" })
    const fights = await FightModel.find({ runId }).sort({ date: -1 })
    res.json(fights)
})
 
router.get("/:id", async (req, res) => {
    const fight = await FightModel.findById(req.params.id)
    if (! fight) return res.status(404).json({ error: "Fight not found" })
    res.json(fight)
})
 
// finir un combat + save les logs
router.post("/:id/finish", async (req, res) => {
    try {
        const { winner, endState, logs } = req.body as {
            winner:   "PLAYER" | "ENEMY"
            endState: FightEndState
            logs:     TurnLog[]
        }
 
        const fight = await FightModel.findByIdAndUpdate(
            req.params.id,
            { status: "finished", winner, endState },
            { new: true }
        )
        if (! fight) return res.status(404).json({ error: "Fight not found" })
 
        const fightLog = await FightLogModel.create({ fightId: fight._id, logs })
 
        res.json({ fight, fightLog })
    } catch (error) {
        res.status(400).json({ error: "Unable to finish fight", details: error })
    }
})
 
router.get("/:id/logs", async (req, res) => {
    const fightLog = await FightLogModel.findOne({ fightId: req.params.id })
    if (! fightLog) return res.status(404).json({ error: "Logs not found" })
    res.json(fightLog.logs)
})
 
export default router
