import { seedCharacters } from "./seedCharacters"

export async function seedDatabase(): Promise<void> {
    await seedCharacters()
}
