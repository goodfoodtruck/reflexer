import mongoose from "mongoose"
import dotenv from "dotenv"
import { connectDatabase } from "./db"
import { seedDatabase, SEED_USERS } from "@scripts/seedDatabase"

dotenv.config()

// Lancé depuis l'hôte : Mongo est exposé par docker-compose sur 27018.
const DEFAULT_URI = "mongodb://localhost:27018/reflexer"

async function seed(): Promise<void> {
    const uri = process.env.MONGODB_URI ?? DEFAULT_URI
    await connectDatabase(uri)
    console.log(`Seeding combat mocks into ${uri}`)

    await seedDatabase()

    console.log("User IDs (fixes — déjà dans VITE_FRIENDLY_PLAYER_ID / VITE_FRIENDLY_OPPONENT_ID) :")
    SEED_USERS.forEach(user => console.log(`  ${user.name}: ${user.id}`))

    console.log("\nSeed done.")
}

seed()
    .then(async () => {
        await mongoose.disconnect()
        process.exit(0)
    })
    .catch(async error => {
        console.error("Seed failed:", error)
        await mongoose.disconnect()
        process.exit(1)
    })
