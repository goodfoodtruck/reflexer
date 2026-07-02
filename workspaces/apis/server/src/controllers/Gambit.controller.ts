import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { GambitService } from "@services/gambit.service"
import type { Gambit } from "@reflexer/engine"

export class GambitController extends AController {
    constructor(private readonly gambitService: GambitService) {
        super()
        this.router.get("/",     this.list)
        this.router.post("/",    this.create)
        this.router.patch("/:id", this.update)
        this.router.delete("/:id", this.remove)
    }

    private list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.query as { userId: string }
            if (!userId) {
                res.status(400).json({ error: "userId is required" })
                return
            }
            const gambits = await this.gambitService.getGambitsByUser(userId)
            res.json(gambits)
        } catch (error) {
            next(error)
        }
    }

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, name, characterId, priority, conditions, targetSelector, intent } = req.body as
                { userId: string; name: string; characterId: string } & Omit<Gambit, "id">
            const gambit = await this.gambitService.createGambit({
                userId, name, characterId, priority, conditions, targetSelector, intent
            })
            res.status(201).json(gambit)
        } catch (error) {
            next(error)
        }
    }

    private update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gambit = await this.gambitService.updateGambit(req.params.id, req.body)
            res.json(gambit)
        } catch (error) {
            next(error)
        }
    }

    private remove = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.gambitService.deleteGambit(req.params.id)
            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }
}
