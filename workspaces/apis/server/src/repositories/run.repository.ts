import { RunModel } from "@models/run.model"

type CreateRunData = {
    userId: string
    gold: number
    playerFloorIndex: number
}

export class RunRepository {
    async findByUserId(userId: string) {
        return RunModel.find({ userId }).sort({ createdAt: -1 })
    }

    async findById(id: string) {
        return RunModel.findById(id)
    }

    async create(data: CreateRunData) {
        return RunModel.create({
            userId: data.userId,
            gold: data.gold,
            playerFloorIndex: data.playerFloorIndex
        })
    }
}