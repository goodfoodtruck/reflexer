import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { TeamService } from "@services/team.service"
import { requireAuth } from "../middlewares/auth.middleware"

export class TeamController extends AController {
    constructor(private readonly teamService: TeamService) {
        super()
        this.router.use(requireAuth)
        this.router.get("/me",           this.getMyTeam)
        this.router.post("/me",          this.upsertMyTeam)
        this.router.get("/me/readiness", this.getTeamReadiness)
    }

    private getMyTeam = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const team = await this.teamService.getTeamByUserId(req.user!.userId)
            res.json(team)
        } catch (error) {
            next(error)
        }
    }

    private upsertMyTeam = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { characterIds } = req.body as { characterIds?: string[] }
            if (!Array.isArray(characterIds) || characterIds.length !== 2) {
                res.status(400).json({ error: "characterIds doit contenir exactement 2 ids" })
                return
            }
            const team = await this.teamService.upsertTeam(req.user!.userId, characterIds)
            res.json(team)
        } catch (error) {
            next(error)
        }
    }

    private getTeamReadiness = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const readiness = await this.teamService.getTeamReadiness(req.user!.userId)
            res.json(readiness)
        } catch (error) {
            next(error)
        }
    }
}
