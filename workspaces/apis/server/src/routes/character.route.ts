import { Router } from "express"
import { CharacterModel } from "@models/character.model"
 
const router = Router()

router.get("/", async (req, res) => {
    const characters = await CharacterModel.find({ slug: { $exists: true } })
    res.json(characters)
})

router.get("/:id", async (req, res) => {
    const character = await CharacterModel.findById(req.params.id)
    if (!character) return res.status(404).json({ error: "Character not found" })
    res.json(character)
})
 
export default router
