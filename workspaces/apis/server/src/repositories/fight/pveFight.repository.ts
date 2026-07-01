import { PveFightModel } from "@models/fight/pveFight.model"

export class PveFightRepository {
    async findByUserId(userId: string) {
        return (PveFightModel as any).find({ userId }).sort({ createdAt: -1 }).limit(20)
    }
}