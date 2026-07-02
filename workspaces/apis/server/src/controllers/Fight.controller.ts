import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { FightService } from "@services/fight.service"
import type { FightMapID } from "@reflexer/engine"

export class FightController extends AController {
    constructor(private readonly fightService: FightService) {
        super()
        this.router.get("/maps",                          this.getMaps)
        this.router.post("/friendly",                     this.playFriendly)
        this.router.post("/ranked",                       this.playRanked)
        this.router.get("/history/friendly/:userId",      this.getFriendlyHistory)
        this.router.get("/history/ranked/:userId",        this.getRankedHistory)
        this.router.get("/history/training/:userId",      this.getTrainingHistory)
        this.router.get("/history/:fightId",              this.getFightById)
    }

    private getMaps = (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(this.fightService.getMaps())
        } catch (error) {
            next(error)
        }
    }

    private playFriendly = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playerId, opponentId, fightMapId } = req.body as {
                playerId: string; opponentId: string; fightMapId: FightMapID
            }
            const result = await this.fightService.playFriendly(playerId, opponentId, fightMapId)
            res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }

    private playRanked = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body as { userId: string }
            const result = await this.fightService.playRanked(userId)
            res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }

    private getFriendlyHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fights = await this.fightService.getFriendlyHistory(req.params.userId)
            res.json(fights)
        } catch (error) {
            next(error)
        }
    }

    private getRankedHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fights = await this.fightService.getRankedHistory(req.params.userId)
            res.json(fights)
        } catch (error) {
            next(error)
        }
    }

    private getTrainingHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fights = await this.fightService.getTrainingHistory(req.params.userId)
            res.json(fights)
        } catch (error) {
            next(error)
        }
    }

    private getFightById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fight = await this.fightService.getFightById(req.params.fightId)
            res.json(fight)
        } catch (error) {
            next(error)
        }
    }
}
