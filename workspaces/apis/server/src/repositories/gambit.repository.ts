import { GambitModel } from "@models/gambit.model"
import { Types } from "mongoose"
import type { Gambit } from "@reflexer/engine"

type CreateGambitData = {
    userId: string
    name: string
    characterId: string
    priority: number
    conditions: Gambit["conditions"]
    targetSelector: Gambit["targetSelector"]
    intent: Gambit["intent"]
}

export class GambitRepository {
    async findByUserAndCharacter(userId: string, characterId: unknown) {
        return GambitModel
            .find({ userId, characterId })
            .sort({ priority: 1 })
            .lean()
    }

    async countByUserAndCharacter(userId: string, characterId: unknown) {
        return GambitModel.countDocuments({ userId, characterId })
    }

    async create(data: CreateGambitData) {
        return GambitModel.create({
            userId: new Types.ObjectId(data.userId),
            name: data.name,
            characterId: new Types.ObjectId(data.characterId),
            priority: data.priority,
            conditions: data.conditions,
            targetSelector: data.targetSelector,
            intent: data.intent
        })
    }

    async updateById(id: string, data: object) {
        return GambitModel.findByIdAndUpdate(id, data, { new: true })
    }

    async deleteById(id: string) {
        return GambitModel.findByIdAndDelete(id)
    }
}