import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { RunService } from "@services/run.service"

export class RunController extends AController {
    constructor(private readonly runService: RunService) {
        super()
        this.router.post("/startNewGame", this.startNewGame)
        this.router.get("/",              this.list)
        this.router.get("/:id",           this.getById)
    }

    private startNewGame = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body as { userId: string }
            const run = await this.runService.startNewGame(userId)
            res.status(201).json(run)
        } catch (error) {
            next(error)
        }
    }

    private list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.query
            if (!userId) {
                res.status(400).json({ error: "userId is required" })
                return
            }
            const runs = await this.runService.getRunsByUserId(userId as string)
            res.json(runs)
        } catch (error) {
            next(error)
        }
    }

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const run = await this.runService.getRunById(req.params.id)
            res.json(run)
        } catch (error) {
            next(error)
        }
    }
}
