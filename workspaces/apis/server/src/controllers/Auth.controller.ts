import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { AuthService } from "@services/auth.service"
import { requireAuth } from "../middlewares/auth.middleware"

export class AuthController extends AController {
    constructor(private readonly authService: AuthService) {
        super()
        this.router.post("/register",       this.register)
        this.router.post("/login",           this.login)
        this.router.post("/reset-password",  this.resetPassword)
        this.router.get("/me", requireAuth,  this.getMe)
    }

    private register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, password, secretAnswer } = req.body as {
                name: string; password: string; secretAnswer: string
            }
            if (!name || !password || !secretAnswer) {
                res.status(400).json({ error: "Pseudo, mot de passe et réponse secrète requis" })
                return
            }
            const result = await this.authService.register(name, password, secretAnswer)
            res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }

    private login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, password } = req.body as { name: string; password: string }
            if (!name || !password) {
                res.status(400).json({ error: "Pseudo et mot de passe requis" })
                return
            }
            const result = await this.authService.login(name, password)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    private resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, secretAnswer, newPassword } = req.body as {
                name: string; secretAnswer: string; newPassword: string
            }
            if (!name || !secretAnswer || !newPassword) {
                res.status(400).json({ error: "Pseudo, réponse secrète et nouveau mot de passe requis" })
                return
            }
            const result = await this.authService.resetPassword(name, secretAnswer, newPassword)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    private getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.getMe(req.user!.userId)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}
