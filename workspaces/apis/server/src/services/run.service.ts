import { RunRepository } from "@repositories/run.repository"
import { createGameEngine } from "@reflexer/engine"
import { AppError } from "../errors/AppError"
import { runStartedTotal } from "../metrics"

type GameEngine = ReturnType<typeof createGameEngine>

export class RunService {
    constructor(
        private readonly runRepo: RunRepository,
        private readonly engine: GameEngine
    ) {}

    async startNewGame(userId: string) {
        const result = this.engine.startNewGame()
        if (!result.success) throw new AppError(400, "RUN_START_ERROR", "Impossible de démarrer une nouvelle partie.")

        runStartedTotal.inc()
        return this.runRepo.create({
            userId,
            gold: result.value.runPlayerData.gold,
            playerFloorIndex: result.value.runPlayerData.playerFloorIndex
        })
    }

    async getRunsByUserId(userId: string) {
        return this.runRepo.findByUserId(userId)
    }

    async getRunById(id: string) {
        const run = await this.runRepo.findById(id)
        if (!run) throw new AppError(404, "RUN_NOT_FOUND", "Partie introuvable.")
        return run
    }
}
