import { Router } from "express"
import { CharacterModel } from "@models/character.model"
import { TeamModel } from "@models/team.model"
import { requireAuth } from "../auth.middleware"

const router = Router()

router.use(requireAuth)

router.get("/me", async (req, res) => {
    try {
        const team = await TeamModel.findOne({ userId: req.user!.userId }).populate("characterIds")
        res.json(team)
    } catch (error) {
        console.error("Erreur GET /teams/me:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})

// creation ou update
router.post("/me", async (req, res) => {
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
        console.error("Erreur POST /teams/me:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})

export default router