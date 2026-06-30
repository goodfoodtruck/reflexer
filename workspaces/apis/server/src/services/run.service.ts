import { RunRepository } from "@repositories/run.repository"
import { createGameEngine } from "@reflexer/engine"

type GameEngine = ReturnType<typeof createGameEngine>

export class RunService {
    constructor(
        private readonly runRepo: RunRepository,
        private readonly engine: GameEngine
    ) {}

    async startNewGame(userId: string) {
        const result = this.engine.startNewGame()
        if (!result.success) throw Object.assign(new Error(result.reason), { status: 400 })

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
        if (!run) throw Object.assign(new Error("Run not found"), { status: 404 })
        return run
    }
}
