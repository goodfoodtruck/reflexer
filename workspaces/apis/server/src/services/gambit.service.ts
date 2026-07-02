import { GambitRepository } from "@repositories/gambit.repository"
import { CharacterRepository } from "@repositories/character.repository"
import type { CharacterName, Gambit } from "@reflexer/engine"
import type { Types } from "mongoose"
import { AppError } from "../errors/AppError"

export type GambitsByCharacter = {
    characterId: Types.ObjectId
    characterName: CharacterName
    gambits: Gambit[]
}

export class GambitService {
    constructor(
        private readonly gambitRepo: GambitRepository,
        private readonly characterRepo: CharacterRepository
    ) {}

    async getGambitsByUser(userId: string): Promise<GambitsByCharacter[]> {
        const characters = await this.characterRepo.findAll()

        return Promise.all(
            characters.map(async (character) => {
                const gambits = await this.gambitRepo.findByUserAndCharacter(userId, character._id)
                return {
                    characterId: character._id as Types.ObjectId,
                    characterName: character.characterName as CharacterName,
                    gambits: gambits as unknown as Gambit[]
                }
            })
        )
    }

    async createGambit(data: {
        userId: string
        name: string
        characterId: string
        priority: number
        conditions: Gambit["conditions"]
        targetSelector: Gambit["targetSelector"]
        intent: Gambit["intent"]
    }) {
        return this.gambitRepo.create(data)
    }

    async updateGambit(id: string, data: object) {
        const gambit = await this.gambitRepo.updateById(id, data)
        if (!gambit) throw new AppError(404, "GAMBIT_NOT_FOUND", "Gambit introuvable.")
        return gambit
    }

    async deleteGambit(id: string) {
        const gambit = await this.gambitRepo.deleteById(id)
        if (!gambit) throw new AppError(404, "GAMBIT_NOT_FOUND", "Gambit introuvable.")
    }
}
