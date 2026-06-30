import { PvpFightModel } from "@models/fight/pvpFight.model"
import type { FightEndState, FightSnapshot, TurnLog } from "@reflexer/engine"

type TeamMemberSnapshot = {
    characterName: string
    baseStats: object
    gambits: object[]
}

type CreatePvpFightData = {
    mode: "RANKED" | "FRIENDLY"
    playerUserId: string
    opponentUserId: string
    playerTeam: TeamMemberSnapshot[]
    opponentTeam: TeamMemberSnapshot[]
    winnerId: string
    endState: FightEndState
    initialState: FightSnapshot
    logs: TurnLog[]
}

export class PvpFightRepository {
    async findById(id: string) {
        return PvpFightModel.findById(id)
    }

    async findFriendlyByUser(userId: string) {
        return PvpFightModel.find({
            mode: "FRIENDLY",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        }).sort({ createdAt: -1 }).limit(20)
    }

    async findRankedByUser(userId: string) {
        return PvpFightModel.find({
            mode: "RANKED",
            $or: [{ playerUserId: userId }, { opponentUserId: userId }]
        })
            .populate("ranking")
            .sort({ createdAt: -1 })
            .limit(20)
    }

    async create(data: CreatePvpFightData) {
        return PvpFightModel.create(data)
    }
}