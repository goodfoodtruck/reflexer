import { Router, Request, Response, NextFunction } from "express"
import { RunModel } from "@models/run.model"
import { engine } from "../index"
 
const router = Router()

router.post("/startNewGame", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body as { userId: string }

        const result = engine.startNewGame()

        if (! result.success) {
            res.status(400).json({ error: result.reason })
            return
        }

        const run = await RunModel.create({
            userId,
            gold: result.value.runPlayerData.gold,
            playerFloorIndex: result.value.runPlayerData.playerFloorIndex
        })

        res.status(201).json(run)

    } catch (error) {
        next(error)
    }
})

// Récupérer toutes les runs d'un utilisateur
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query
        if (! userId) return res.status(400).json({ error: "userId is required" })
        const runs = await RunModel.find({ userId }).sort({ createdAt: -1 })
        res.json(runs)
    } catch (error) {
        next(error)
    }
})
 
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const run = await RunModel.findById(req.params.id)
        if (! run) return res.status(404).json({ error: "Run not found" })
        res.json(run)
    } catch (error) {
        next(error)
    }
})
 
export default router
 
