import { UserRankingModel } from "@models/ranked/user_ranking.model"
import { UserModel } from "@models/user.model"
import { Router, Request, Response, NextFunction } from "express"

const router = Router()

router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId

        const user = await UserModel.findById(userId)
        if (! user) {
            res.status(404).json({ error: 'User not found.' })
            return
        }

        const userRanking = await UserRankingModel.findOne({ userId })
        if (! userRanking) {
            res.status(404).json({ error: 'User ranking not found.' })
            return
        }

        res.json({
            user: {
                id: user.id,
                name: user.name
            },
            ranking: userRanking.toObject()
        })
    } catch (error) {
        next(error)
    }
})


export default router