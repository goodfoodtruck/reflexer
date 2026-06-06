import { Router } from "express"
import { RunModel } from "../models/run.model"
 
const router = Router()
 
router.post("/", async (req, res) => {
    try {
        const { userId } = req.body as { userId: string }
        const run = await RunModel.create({ userId })
        res.status(201).json(run)
    } catch (error) {
        res.status(400).json({ error: "Unable to create run", details: error })
    }
})
 
// Récupérer toutes les runs d'un utilisateur
router.get("/", async (req, res) => {
    const { userId } = req.query
    if (! userId) return res.status(400).json({ error: "userId is required" })
    const runs = await RunModel.find({ userId }).sort({ createdAt: -1 })
    res.json(runs)
})
 
router.get("/:id", async (req, res) => {
    const run = await RunModel.findById(req.params.id)
    if (! run) return res.status(404).json({ error: "Run not found" })
    res.json(run)
})
 
export default router
 
