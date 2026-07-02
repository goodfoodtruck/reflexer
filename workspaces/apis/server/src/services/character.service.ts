import { CharacterRepository } from "@repositories/character.repository"
import { AppError } from "../errors/AppError"

export class CharacterService {
    constructor(private readonly characterRepo: CharacterRepository) {}

    async getAllCharacters() {
        return this.characterRepo.findPublished()
    }

    async getCharacterById(id: string) {
        const character = await this.characterRepo.findById(id)
        if (!character) throw new AppError(404, "CHARACTER_NOT_FOUND", "Personnage introuvable.")
        return character
    }
}
