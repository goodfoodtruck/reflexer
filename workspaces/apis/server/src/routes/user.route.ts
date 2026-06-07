import { Router } from "express"
import { UserModel } from "@models/user.model"
 
const router = Router()
 
router.get("/:id", async (req, res) => {
    const user = await UserModel.findById(req.params.id)
    if (! user) return res.status(404).json({ error: "User not found" })
    res.json(user)
})
 
export default router
 
