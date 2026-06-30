import { CharacterRepository } from "@repositories/character.repository"

export class CharacterService {
    constructor(private readonly characterRepo: CharacterRepository) {}

    async getAllCharacters() {
        return this.characterRepo.findPublished()
    }

    async getCharacterById(id: string) {
        const character = await this.characterRepo.findById(id)
        if (!character) throw Object.assign(new Error("Character not found"), { status: 404 })
        return character
    }
}
