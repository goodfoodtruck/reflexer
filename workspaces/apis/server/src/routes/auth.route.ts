import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserModel } from "@models/user.model"
import { UserRankingModel } from "@models/ranked/user_ranking.model"

const router      = Router()
const JWT_SECRET  = process.env.JWT_SECRET ?? "reflexer_secret"
const SALT_ROUNDS = 10
const SECRET_QUESTION = "Quel est le prénom de votre mère ?"

router.post("/register", async (req, res) => {
    try {
        const { name, password, secretAnswer } = req.body as {
            name:         string
            password:     string
            secretAnswer: string
        }

        if (! name || ! password || ! secretAnswer) {
            res.status(400).json({ error: "Pseudo, mot de passe et réponse secrète requis" })
            return
        }

        const existing = await UserModel.findOne({ name })
        if (existing) {
            res.status(409).json({ error: "Ce pseudo est déjà pris" })
            return
        }

        const hashedPassword     = await bcrypt.hash(password,     SALT_ROUNDS)
        const hashedSecretAnswer = await bcrypt.hash(
            secretAnswer.toLowerCase().trim(),
            SALT_ROUNDS
        )

        const user = await UserModel.create({
            name,
            password:     hashedPassword,
            secretAnswer: hashedSecretAnswer,
        })

        // chaque joueur a des données de ranking par defaut
        await UserRankingModel.create({ userId: user._id })

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(201).json({ token, user: { id: user._id, name: user.name } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erreur lors de l'inscription" })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body as { name: string; password: string }

        if (! name || ! password) {
            res.status(400).json({ error: "Pseudo et mot de passe requis" })
            return
        }

        const user = await UserModel.findOne({ name })
        if (! user) {
            res.status(401).json({ error: "Pseudo ou mot de passe incorrect" })
            return
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (! passwordMatch) {
            res.status(401).json({ error: "Pseudo ou mot de passe incorrect" })
            return
        }

        const token = jwt.sign(
            { userId: user._id.toString(), name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({ token, user: { id: user._id, name: user.name } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erreur lors de la connexion" })
    }
})

router.get("/question", (_, res) => {
    res.json({ question: SECRET_QUESTION })
})

router.post("/reset-password", async (req, res) => {
    try {
        const { name, secretAnswer, newPassword } = req.body as {
            name:         string
            secretAnswer: string
            newPassword:  string
        }

        if (! name || ! secretAnswer || ! newPassword) {
            res.status(400).json({ error: "Pseudo, réponse secrète et nouveau mot de passe requis" })
            return
        }

        const user = await UserModel.findOne({ name })
        if (! user) {
            res.status(404).json({ error: "Utilisateur introuvable" })
            return
        }

        const answerMatch = await bcrypt.compare(
            secretAnswer.toLowerCase().trim(),
            user.secretAnswer
        )
        if (! answerMatch) {
            res.status(401).json({ error: "Réponse incorrecte" })
            return
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
        await UserModel.findByIdAndUpdate(user._id, { password: hashedNewPassword })

        res.json({ message: "Mot de passe mis à jour avec succès" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erreur lors de la réinitialisation" })
    }
})

export default router