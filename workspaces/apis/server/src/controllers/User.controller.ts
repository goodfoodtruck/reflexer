import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { UserService } from "@services/user.service"
import { requireAuth } from "../middlewares/auth.middleware"

export class UserController extends AController {
    constructor(private readonly userService: UserService) {
        super()
        this.router.post("/batch",                             this.batch)
        this.router.get("/search",                             this.search)
        this.router.get("/notifications",    requireAuth,      this.getNotifications)
        this.router.patch("/notifications/:id/read", requireAuth, this.markNotificationRead)
        this.router.get("/:id",                                this.getById)
    }

    private batch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids } = req.body as { ids: string[] }
            const users = await this.userService.getUsersByIds(ids)
            res.json(users)
        } catch (error) {
            next(error)
        }
    }

    private search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.query as { name: string }
            if (!name || name.trim() === '') {
                res.status(400).json({ error: 'Paramètre name requis' })
                return
            }
            const users = await this.userService.searchUsers(name)
            res.json(users)
        } catch (error) {
            next(error)
        }
    }

    private getNotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notifications = await this.userService.getUnreadNotifications(req.user!.userId)
            res.json(notifications)
        } catch (error) {
            next(error)
        }
    }

    private markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await this.userService.markNotificationRead(req.params.id, req.user!.userId)
            res.json(notification)
        } catch (error) {
            next(error)
        }
    }

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.getUserById(req.params.id)
            res.json(user)
        } catch (error) {
            next(error)
        }
    }
}
