import { PveFightModel } from "@models/fight/pveFight.model"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { Router, Request, Response, NextFunction } from "express"

const router = Router()

router.get("/:fightId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fightId } = req.params

        const fight = await PvpFightModel.findById(fightId)
        if (! fight) { res.status(404).json({ error: "FIGHT_NOT_FOUND" }); return }

        res.json(fight)
    } catch (error) {
        next(error)
    }
})

// GET /fights/history/friendly/:userId
router.get("/friendly/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        const fights = await PvpFightModel.find({
            mode: "FRIENDLY",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        }).sort({ createdAt: -1 }).limit(20)

        res.json(fights)
    } catch (error) {
        next(error)
    }
})

// GET /fights/history/ranked/:userId
router.get("/ranked/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        
        const fights = await PvpFightModel.find({
            mode: "RANKED",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        })
        .populate("ranking")
        .sort({ createdAt: -1 })
        .limit(20)        

        res.json(fights)
    } catch (error) {
        next(error)
    }
})

// GET /fights/history/training/:userId
router.get("/training/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        const fights = await PveFightModel.find({ userId })
            .sort({ createdAt: -1 }).limit(20)

        res.json(fights)
    } catch (error) {
        next(error)
    }
})

export default router