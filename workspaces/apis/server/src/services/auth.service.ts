import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "@repositories/user.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"

const JWT_SECRET  = process.env.JWT_SECRET ?? "reflexer_secret"
const SALT_ROUNDS = 10

export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly userRankingRepo: UserRankingRepository
    ) {}

    async register(name: string, password: string, secretAnswer: string) {
        const existing = await this.userRepo.findByName(name)
        if (existing) throw Object.assign(new Error("Ce pseudo est déjà pris"), { status: 409 })

        const hashedPassword     = await bcrypt.hash(password, SALT_ROUNDS)
        const hashedSecretAnswer = await bcrypt.hash(secretAnswer.toLowerCase().trim(), SALT_ROUNDS)

        const user = await this.userRepo.create({ name, password: hashedPassword, secretAnswer: hashedSecretAnswer })
        await this.userRankingRepo.create(user._id.toString())

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )
        return { token, user: { id: user._id, name: user.name } }
    }

    async login(name: string, password: string) {
        const user = await this.userRepo.findByName(name)
        if (!user) throw Object.assign(new Error("Pseudo ou mot de passe incorrect"), { status: 401 })

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) throw Object.assign(new Error("Pseudo ou mot de passe incorrect"), { status: 401 })

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )
        return { token, user: { id: user._id, name: user.name } }
    }

    async resetPassword(name: string, secretAnswer: string, newPassword: string) {
        const user = await this.userRepo.findByName(name)
        if (!user) throw Object.assign(new Error("Utilisateur introuvable"), { status: 404 })

        const answerMatch = await bcrypt.compare(secretAnswer.toLowerCase().trim(), user.secretAnswer)
        if (!answerMatch) throw Object.assign(new Error("Réponse incorrecte"), { status: 401 })

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
        await this.userRepo.updatePassword(user._id.toString(), hashedNewPassword)

        return { message: "Mot de passe mis à jour avec succès" }
    }

    async getMe(userId: string) {
        const user = await this.userRepo.findById(userId)
        if (!user) throw Object.assign(new Error("Utilisateur introuvable"), { status: 401 })
        return { id: user._id, name: user.name }
    }
}
