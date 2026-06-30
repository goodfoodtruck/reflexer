import { Router, Request, Response, NextFunction } from "express"
import { CharacterModel } from "@models/character.model"
 
const router = Router()

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const characters = await CharacterModel.find({ slug: { $exists: true } })
        res.json(characters)
    }
    catch(error) {
        next(error)
    }
})

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const character = await CharacterModel.findById(req.params.id)
        if (! character) return res.status(404).json({ error: "Character not found" })
        res.json(character)
    }
    catch(error) {
        next(error)
    }
})
 
export default router
