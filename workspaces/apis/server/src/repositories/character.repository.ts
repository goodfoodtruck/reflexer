import { CharacterModel } from "@models/character.model"

export class CharacterRepository {
    async findAll() {
        return CharacterModel.find()
    }

    async findPublished() {
        return CharacterModel.find({ slug: { $exists: true } })
    }

    async findById(id: string) {
        return CharacterModel.findById(id)
    }

    async countByIds(ids: string[]) {
        return CharacterModel.countDocuments({ _id: { $in: ids } })
    }
}