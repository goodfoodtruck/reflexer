import { Router } from "express"
import friendlyRouter from "./friendly.route"
import historyRouter from './history.route'
import rankedRouter from "./ranked.route"
import mapsRouter from "./maps.route"

const router = Router()

router.use("/friendly", friendlyRouter)
router.use("/ranked", rankedRouter)
router.use("/history", historyRouter)
router.use("/maps", mapsRouter)

export default router