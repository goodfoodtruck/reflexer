import { CharacterModel } from "@models/character.model"

const DEFAULT_CHARACTERS = [
    {
        characterName: "CHARACTER_1",
        baseStats: { health: 120, energy: 8, armor: 5 }
    },
    {
        characterName: "CHARACTER_2",
        baseStats: { health: 80, energy: 15, armor: 2 }
    }
]

export async function seedCharacters(): Promise<void> {
    const existingCount = await CharacterModel.countDocuments()
    if (existingCount > 0) return // on veut uniquement en avoir 2 en bdd

    await CharacterModel.insertMany(DEFAULT_CHARACTERS)
    console.log(`Seeded ${DEFAULT_CHARACTERS.length} characters`)
}