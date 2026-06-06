import { Router } from "express"
import type { AllyName, Gambit } from "@reflexer/engine"
import { PlayerModel } from "../models/player.model"
 
const router = Router()
 
router.post("/", async (req, res) => {
    try {
        const { name, teamComposition } = req.body as { name: string; teamComposition: AllyName[] }
 
        const allies = teamComposition.map(allyName => ({ allyName, gambits: [] }))
        const player = await PlayerModel.create({ name, teamComposition, allies })
 
        res.status(201).json(player)
    } catch (error) {
        console.error(error)
        res.status(400).json({ error: "Unable to create player", details: error })
    }
})
 
// Récupérer un joueur par id
router.get("/:id", async (req, res) => {
    const player = await PlayerModel.findById(req.params.id)
    if (! player) return res.status(404).json({ error: "Player not found" })
    res.json(player)
})
 
// Récupérer tous les gambits d'un allié
router.get("/:id/allies/:allyName/gambits", async (req, res) => {
    const player = await PlayerModel.findById(req.params.id)
    if (! player) return res.status(404).json({ error: "Player not found" })
 
    const ally = player.allies.find(a => a.allyName === req.params.allyName)
    if (! ally) return res.status(404).json({ error: "Ally not found" })
 
    res.json(ally.gambits)
})
 
// Ajouter un gambit à un allié
router.post("/:id/allies/:allyName/gambits", async (req, res) => {
    try {
        const gambit   = req.body as Gambit
        const allyName = req.params.allyName as AllyName
 
        const player = await PlayerModel.findOneAndUpdate(
            { _id: req.params.id, "allies.allyName": allyName },
            { $push: { "allies.$.gambits": gambit } },
            { new: true }
        )
        if (! player) return res.status(404).json({ error: "Player or ally not found" })
        res.status(201).json(player)
    } catch (error) {
        res.status(400).json({ error: "Unable to add gambit", details: error })
    }
})
 
// Supprimer un gambit d'un allié
router.delete("/:id/allies/:allyName/gambits/:gambitId", async (req, res) => {
    try {
        const allyName = req.params.allyName as AllyName
 
        const player = await PlayerModel.findOneAndUpdate(
            { _id: req.params.id, "allies.allyName": allyName },
            { $pull: { "allies.$.gambits": { id: req.params.gambitId } } },
            { new: true }
        )
        if (! player) return res.status(404).json({ error: "Player or ally not found" })
        res.json(player)
    } catch (error) {
        res.status(400).json({ error: "Unable to delete gambit", details: error })
    }
})
 
export default router
