import { Router } from "express"
import type { AllyName } from "@reflexer/engine"
import { CharacterModel } from "../models/character.model"
 
const router = Router()
 
router.post("/", async (req, res) => {
    try {
        const { userId, name, allyName } = req.body as {
            userId:   string
            name:     string
            allyName: AllyName
        }
        const ally = await CharacterModel.create({ userId, name, allyName })
        res.status(201).json(ally)
    } catch (error) {
        res.status(400).json({ error: "Unable to create ally", details: error })
    }
})
 
router.get("/", async (req, res) => {
    const { userId } = req.query
    if (! userId) return res.status(400).json({ error: "userId is required" })
    const allies = await CharacterModel.find({ userId })
    res.json(allies)
})
 
router.get("/:id", async (req, res) => {
    const ally = await CharacterModel.findById(req.params.id)
    if (! ally) return res.status(404).json({ error: "Character not found" })
    res.json(ally)
})
 
export default router
