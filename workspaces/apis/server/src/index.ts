import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDatabase } from "./db"
import userRoutes   from "@routes/user.route"
import characterRoutes   from "@routes/character.route"
import gambitRoutes from "@routes/gambit.route"
import runRoutes    from "@routes/run.route"
import fightRoutes  from "@routes/fight"
import { createGameEngine } from "@reflexer/engine"
import { seedDatabase } from "@scripts/seedDatabase"
import authRoutes from "@routes/auth.route"
import userRankingRoutes from "@routes/userRanking.route"
import teamRoutes   from "@routes/team.route"
import logger from "./logger"
import morgan from "morgan"
import { errorMiddleware } from "./middlewares/errorMiddleware"
 
dotenv.config()

export const engine = createGameEngine()
 
const app = express()
app.use(cors())
app.use(express.json())

const stream = {
    write: (message: string) => logger.info(message.trim())
}

app.use(morgan('combined', { stream }))
 
app.use("/users",         userRoutes)
app.use("/users/ranking", userRankingRoutes)
app.use("/characters",    characterRoutes)
app.use("/gambits",       gambitRoutes)
app.use("/runs",          runRoutes)
app.use("/fights",        fightRoutes)
app.use("/teams",         teamRoutes)
app.use("/auth",          authRoutes)
 
app.get("/", (_, res) => res.json({ status: "ok", service: "reflexer-server" }))

app.use(errorMiddleware)
 
const start = async () => {
    const uri  = process.env.MONGODB_URI ?? "mongodb://localhost:27017/reflexer"
    await connectDatabase(uri)
    await seedDatabase()
 
    const port = Number(process.env.PORT ?? 4000)
    app.listen(port, () => {
        logger.info(`Reflexer server running on port ${port}`)
    })
}

start().catch(error => {
    logger.error("Failed to start server", { error })
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason })
})

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error })
    process.exit(1)
})
 
