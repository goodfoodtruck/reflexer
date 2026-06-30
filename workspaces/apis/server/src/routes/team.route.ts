import { Router, Request, Response, NextFunction } from "express"
import { CharacterModel, type CharacterDocument } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import { TeamModel } from "@models/team.model"
import { requireAuth } from "../auth.middleware"

const router = Router()

router.use(requireAuth)

router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const team = await TeamModel.findOne({ userId: req.user!.userId }).populate("characterIds")
        res.json(team)
    } catch (error) {
        next(error)
    }
})

// creation ou update
router.post("/me", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { characterIds } = req.body as { characterIds?: string[] }
        if (!Array.isArray(characterIds) || characterIds.length !== 2) {
            res.status(400).json({ error: "characterIds doit contenir exactement 2 ids" })
            return
        }

        const validCount = await CharacterModel.countDocuments({ _id: { $in: characterIds } })
        if (validCount !== 2) {
            res.status(400).json({ error: "Un ou plusieurs personnages sont introuvables" })
            return
        }

        const team = await TeamModel.findOneAndUpdate(
            { userId: req.user!.userId },
            { characterIds },
            { upsert: true, new: true, runValidators: true }
        ).populate("characterIds")

        res.json(team)
    } catch (error) {
        next(error)
    }
})

// Vérifie qu'au moins 1 gambit existe pour chacun des 2 personnages de l'équipe.
router.get("/me/readiness", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const team = await TeamModel.findOne({ userId: req.user!.userId }).populate("characterIds")
        if (! team) {
            res.json({ ready: false, missingCharacterNames: [] })
            return
        }

        const characters = team.characterIds as unknown as CharacterDocument[]
        const missingCharacterNames: string[] = []
        for (const character of characters) {
            const count = await GambitModel.countDocuments({
                userId: req.user!.userId,
                characterId: character._id
            })
            if (count === 0) missingCharacterNames.push(character.characterName)
        }

        res.json({ ready: missingCharacterNames.length === 0, missingCharacterNames })
    } catch (error) {
        next(error)
    }
})

export default router