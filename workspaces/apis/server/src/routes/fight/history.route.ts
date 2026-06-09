import { PveFightModel } from "@models/fight/pveFight.model"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { Router } from "express"

const router = Router()

// GET /fights/history/friendly/:userId
router.get("/friendly/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const fights = await PvpFightModel.find({
            mode: "FRIENDLY",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        }).sort({ createdAt: -1 }).limit(20)

        res.json(fights)
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})

// GET /fights/history/ranked/:userId
router.get("/ranked/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const fights = await PvpFightModel.find({
            mode: "RANKED",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        }).sort({ createdAt: -1 }).limit(20)

        res.json(fights)
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})

// GET /fights/history/training/:userId
router.get("/training/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const fights = await PveFightModel.find({ userId })
            .sort({ createdAt: -1 }).limit(20)

        res.json(fights)
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})

export default router