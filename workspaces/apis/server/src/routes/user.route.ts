import { Router } from "express"
import { UserModel } from "../models/user.model"
 
const router = Router()
 
router.post("/", async (req, res) => {
    try {
        const { name } = req.body as { name: string }
        const user = await UserModel.create({ name })
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: "Unable to create user", details: error })
    }
})
 
router.get("/:id", async (req, res) => {
    const user = await UserModel.findById(req.params.id)
    if (! user) return res.status(404).json({ error: "User not found" })
    res.json(user)
})
 
export default router
 
