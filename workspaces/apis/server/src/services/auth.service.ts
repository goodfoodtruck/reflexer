import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "@repositories/user.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"
import { AppError } from "../errors/AppError"
import { userRegisteredTotal, loginTotal } from "../metrics"

const JWT_SECRET  = process.env.JWT_SECRET ?? "reflexer_secret"
const SALT_ROUNDS = 10

export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly userRankingRepo: UserRankingRepository
    ) {}

    async register(name: string, password: string, secretAnswer: string) {
        const existing = await this.userRepo.findByName(name)
        if (existing) throw new AppError(409, "PSEUDO_TAKEN", "Ce pseudo est déjà pris.")

        const hashedPassword     = await bcrypt.hash(password, SALT_ROUNDS)
        const hashedSecretAnswer = await bcrypt.hash(secretAnswer.toLowerCase().trim(), SALT_ROUNDS)

        const user = await this.userRepo.create({ name, password: hashedPassword, secretAnswer: hashedSecretAnswer })
        await this.userRankingRepo.create(user._id.toString())

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )
        userRegisteredTotal.inc()
        return { token, user: { id: user._id, name: user.name } }
    }

    async login(name: string, password: string) {
        const user = await this.userRepo.findByName(name)
        if (!user) {
            loginTotal.inc({ success: 'false' })
            throw new AppError(401, "WRONG_CREDENTIALS", "Pseudo ou mot de passe incorrect.")
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            loginTotal.inc({ success: 'false' })
            throw new AppError(401, "WRONG_CREDENTIALS", "Pseudo ou mot de passe incorrect.")
        }

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )
        loginTotal.inc({ success: 'true' })
        return { token, user: { id: user._id, name: user.name } }
    }

    async resetPassword(name: string, secretAnswer: string, newPassword: string) {
        const user = await this.userRepo.findByName(name)
        if (!user) throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable.")

        const answerMatch = await bcrypt.compare(secretAnswer.toLowerCase().trim(), user.secretAnswer)
        if (!answerMatch) throw new AppError(401, "WRONG_SECRET_ANSWER", "Réponse secrète incorrecte.")

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
        await this.userRepo.updatePassword(user._id.toString(), hashedNewPassword)

        return { message: "Mot de passe mis à jour avec succès" }
    }

    async getMe(userId: string) {
        const user = await this.userRepo.findById(userId)
        if (!user) throw new AppError(401, "USER_NOT_AUTHENTICATED", "Utilisateur non authentifié.")
        return { id: user._id, name: user.name }
    }
}
