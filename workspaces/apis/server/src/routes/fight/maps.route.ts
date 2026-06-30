import { Router, Request, Response, NextFunction } from "express"
import { FIGHT_MAPS } from "@reflexer/engine"
import type { FightMapConfig } from "@reflexer/engine"

const router = Router()

router.get("/", (_req, res) => {
    const maps = FIGHT_MAPS.map((map: Partial<FightMapConfig>) => ({
        id: map.id,
        name: map.name,
        thumbnail: map.thumbnail ?? map.background ?? null,
    }))

    res.json(maps)
})

export default router
