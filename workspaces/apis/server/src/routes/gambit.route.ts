import { Router, Request, Response, NextFunction } from "express"
import type { Gambit } from "@reflexer/engine"
import { GambitModel } from "@models/gambit.model"
import { Types } from "mongoose"
import { GambitsByCharacter, getUserGambitsByCharacter } from "@services/gambits.service"
 
const router = Router()
 
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query as { userId: string }
        if (! userId) {
            res.status(400).json({ error: "userId is required" })
            return
        }
        const gambitsByCharacter: GambitsByCharacter[] = await getUserGambitsByCharacter(userId)
        
        res.json(gambitsByCharacter)
    } catch (error) {
        next(error)
    }
})
 
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, name, characterId, priority, conditions, targetSelector, intent } = req.body as
            { userId: string, name: string, characterId: string } & Omit<Gambit, "id">

        const gambit = await GambitModel.create({
            userId: new Types.ObjectId(userId),
            name,
            characterId: new Types.ObjectId(characterId),
            priority,
            conditions,
            targetSelector,
            intent
        })

        res.status(201).json(gambit)
    } catch (error) {
        next(error)
    }
})
 
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gambit = await GambitModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (! gambit) return res.status(404).json({ error: "Gambit not found" })
        res.json(gambit)
    } catch (error) {
        next(error)
    }
})
 
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gambit = await GambitModel.findByIdAndDelete(req.params.id)
        if (! gambit) return res.status(404).json({ error: "Gambit not found" })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})
 
export default router
