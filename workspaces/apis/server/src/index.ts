import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import { connectDatabase } from "./db"
import { createGameEngine } from "@reflexer/engine"
import { seedDatabase } from "@scripts/seedDatabase"
import logger from "./logger"
import { errorMiddleware } from "./middlewares/errorMiddleware"
import { register, httpRequestsTotal, httpRequestDurationSeconds } from "./metrics"

import { UserRepository } from "@repositories/user.repository"
import { CharacterRepository } from "@repositories/character.repository"
import { TeamRepository } from "@repositories/team.repository"
import { GambitRepository } from "@repositories/gambit.repository"
import { RunRepository } from "@repositories/run.repository"
import { NotificationRepository } from "@repositories/notification.repository"
import { PvpFightRepository } from "@repositories/fight/pvpFight.repository"
import { PveFightRepository } from "@repositories/fight/pveFight.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"
import { FightRankingRepository } from "@repositories/ranked/fightRanking.repository"

import { AuthService } from "@services/auth.service"
import { UserService } from "@services/user.service"
import { CharacterService } from "@services/character.service"
import { TeamService } from "@services/team.service"
import { GambitService } from "@services/gambit.service"
import { RunService } from "@services/run.service"
import { FightService } from "@services/fight.service"
import { UserRankingService } from "@services/userRanking.service"

import { AuthController } from "@controllers/Auth.controller"
import { UserController } from "@controllers/User.controller"
import { CharacterController } from "@controllers/Character.controller"
import { TeamController } from "@controllers/Team.controller"
import { GambitController } from "@controllers/Gambit.controller"
import { RunController } from "@controllers/Run.controller"
import { FightController } from "@controllers/Fight.controller"
import { UserRankingController } from "@controllers/UserRanking.controller"

dotenv.config()

type GameEngine = ReturnType<typeof createGameEngine>

const userRepo         = new UserRepository()
const characterRepo    = new CharacterRepository()
const teamRepo         = new TeamRepository()
const gambitRepo       = new GambitRepository()
const runRepo          = new RunRepository()
const notifRepo        = new NotificationRepository()
const pvpFightRepo     = new PvpFightRepository()
const pveFightRepo     = new PveFightRepository()
const userRankingRepo  = new UserRankingRepository()
const fightRankingRepo = new FightRankingRepository()

const createAuthController = (): AuthController => {
    const authService = new AuthService(userRepo, userRankingRepo)
    return new AuthController(authService)
}

const createUserController = (): UserController => {
    const userService = new UserService(userRepo, notifRepo)
    return new UserController(userService)
}

const createCharacterController = (): CharacterController => {
    const characterService = new CharacterService(characterRepo)
    return new CharacterController(characterService)
}

const createTeamController = (): TeamController => {
    const teamService = new TeamService(teamRepo, gambitRepo, characterRepo)
    return new TeamController(teamService)
}

const createGambitController = (): GambitController => {
    const gambitService = new GambitService(gambitRepo, characterRepo)
    return new GambitController(gambitService)
}

const createRunController = (engine: GameEngine): RunController => {
    const runService = new RunService(runRepo, engine)
    return new RunController(runService)
}

const createFightController = (engine: GameEngine): FightController => {
    const teamService  = new TeamService(teamRepo, gambitRepo, characterRepo)
    const fightService = new FightService(
        engine,
        pvpFightRepo,
        pveFightRepo,
        userRepo,
        userRankingRepo,
        fightRankingRepo,
        notifRepo,
        teamService
    )
    return new FightController(fightService)
}

const createUserRankingController = (): UserRankingController => {
    const userRankingService = new UserRankingService(userRepo, userRankingRepo)
    return new UserRankingController(userRankingService)
}

const start = async () => {
    const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/reflexer"
    await connectDatabase(uri)
    await seedDatabase()

    const engine = createGameEngine()
    const app    = express()

    app.use(cors())
    app.use(express.json())
    app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))

    app.use((req: Request, res: Response, next: NextFunction) => {
        const end = httpRequestDurationSeconds.startTimer()
        res.on('finish', () => {
            const route = req.route ? `${req.baseUrl}${req.route.path}` : req.path
            httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode })
            end({ method: req.method, route, status_code: res.statusCode })
        })
        next()
    })

    app.get('/metrics', async (_req: Request, res: Response) => {
        res.set('Content-Type', register.contentType)
        res.end(await register.metrics())
    })

    app.use("/auth",          createAuthController().getRouter())
    app.use("/users/ranking", createUserRankingController().getRouter())
    app.use("/users",         createUserController().getRouter())
    app.use("/characters",    createCharacterController().getRouter())
    app.use("/gambits",       createGambitController().getRouter())
    app.use("/runs",          createRunController(engine).getRouter())
    app.use("/fights",        createFightController(engine).getRouter())
    app.use("/teams",         createTeamController().getRouter())

    app.get("/", (_, res) => res.json({ status: "ok", service: "reflexer-server" }))

    app.use(errorMiddleware)

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
