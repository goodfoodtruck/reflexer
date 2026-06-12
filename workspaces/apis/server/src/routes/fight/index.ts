import { Router } from "express"
import friendlyRouter from "./friendly.route"
import historyRouter from './history.route'

const router = Router()

router.use("/friendly", friendlyRouter)
router.use("/history", historyRouter)

export default router