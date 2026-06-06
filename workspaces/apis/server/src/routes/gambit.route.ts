import { Router } from "express"
import type { Gambit } from "@reflexer/engine"
import { GambitModel } from "../models/gambit.model"
 
const router = Router()
 
router.get("/", async (req, res) => {
    const { allyId } = req.query
    if (! allyId) return res.status(400).json({ error: "allyId is required" })
    const gambits = await GambitModel.find({ allyId }).sort({ priority: 1 })
    res.json(gambits)
})
 
router.post("/", async (req, res) => {
    try {
        const { allyId, priority, conditions, targetSelector, intent } = req.body as
            { allyId: string } & Omit<Gambit, "id">
 
        const gambit = await GambitModel.create({
            allyId,
            priority,
            conditions,
            targetSelector,
            intent
        })
        res.status(201).json(gambit)
    } catch (error) {
        res.status(400).json({ error: "Unable to create gambit", details: error })
    }
})
 
router.patch("/:id", async (req, res) => {
    try {
        const gambit = await GambitModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (! gambit) return res.status(404).json({ error: "Gambit not found" })
        res.json(gambit)
    } catch (error) {
        res.status(400).json({ error: "Unable to update gambit", details: error })
    }
})
 
router.delete("/:id", async (req, res) => {
    try {
        const gambit = await GambitModel.findByIdAndDelete(req.params.id)
        if (! gambit) return res.status(404).json({ error: "Gambit not found" })
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ error: "Unable to delete gambit", details: error })
    }
})
 
export default router
