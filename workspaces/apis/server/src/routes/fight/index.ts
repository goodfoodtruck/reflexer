import { Router } from "express"
import friendlyRouter from "./friendly.route"
import historyRouter from './history.route'
import rankedRouter from "./ranked.route"

const router = Router()

router.use("/friendly", friendlyRouter)
router.use("/ranked", rankedRouter)
router.use("/history", historyRouter)

export default router