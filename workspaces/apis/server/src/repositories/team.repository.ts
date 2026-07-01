import { TeamModel } from "@models/team.model"

type UpsertTeamData = {
    characterIds: string[]
}

export class TeamRepository {
    async findByUserId(userId: string) {
        return TeamModel.findOne({ userId }).populate("characterIds")
    }

    async upsert(userId: string, data: UpsertTeamData) {
        return TeamModel.findOneAndUpdate(
            { userId },
            { characterIds: data.characterIds },
            { upsert: true, new: true, runValidators: true }
        ).populate("characterIds")
    }
}