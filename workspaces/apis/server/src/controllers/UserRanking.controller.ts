import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { UserRankingService } from "@services/userRanking.service"

export class UserRankingController extends AController {
    constructor(private readonly userRankingService: UserRankingService) {
        super()
        this.router.get("/:userId", this.getByUserId)
    }

    private getByUserId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userRankingService.getRankingByUserId(req.params.userId)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}
