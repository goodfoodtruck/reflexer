import mongoose from "mongoose"
import dotenv from "dotenv"
import {
    MOCK_CHARACTERS,
    MOCK_ENEMIES_BY_TAG,
    type AllyConfig,
    type EnemyTag,
    type EnemyName,
} from "@reflexer/engine"
import { connectDatabase } from "./db"
import { AllyModel } from "./models/ally.model"
import { GambitModel } from "./models/gambit.model"

dotenv.config()

// Lancé depuis l'hôte : Mongo est exposé par docker-compose sur 27018.
const DEFAULT_URI = "mongodb://localhost:27018/reflexer"

/** tag → noms inversé en name → tags, pour étiqueter les fiches ennemies. */
function buildTagsByName(): Record<string, EnemyTag[]> {
    const tagsByName: Record<string, EnemyTag[]> = {}
    for (const [tag, names] of Object.entries(MOCK_ENEMIES_BY_TAG) as [EnemyTag, EnemyName[]][]) {
        for (const name of names) (tagsByName[name] ??= []).push(tag)
    }
    return tagsByName
}

async function seed(): Promise<void> {
    const uri = process.env.MONGODB_URI ?? DEFAULT_URI
    await connectDatabase(uri)
    console.log(`Seeding combat mocks into ${uri}`)

    const tagsByName = buildTagsByName()

    // MOCK_CHARACTERS = fiches catalogue (alliés + ennemis), userId absent. Les
    // gambits ne sont pas embarqués : on les insère dans la collection `gambits`,
    // reliés à l'ally via `allyId`. On a donc besoin de l'_id de l'ally d'abord.
    let gambitCount = 0
    for (const [name, raw] of Object.entries(MOCK_CHARACTERS)) {
        const config = raw as AllyConfig
        const ally = await AllyModel.findOneAndUpdate(
            { allyName: name, userId: null }, // catalogue uniquement, jamais une instance user
            { $set: {
                allyName:  name,
                name:      config.name, // libellé affichable, ex. "Aria"
                baseStats: config.baseStats,
                visual:    config.visual,
                tags:      tagsByName[name] ?? [],
            }, $unset: { gambits: "", displayName: "" } }, // nettoie un seed précédent
            // strict: false → laisse passer le $unset d'un champ hors-schéma (gambits)
            { upsert: true, new: true, strict: false }
        )

        if (config.gambits.length > 0) {
            await GambitModel.bulkWrite(
                config.gambits.map(({ id, ...rest }) => ({
                    updateOne: {
                        filter: { allyId: ally!._id, name: id },
                        update: { $set: { allyId: ally!._id, name: id, ...rest } },
                        upsert: true,
                    },
                }))
            )
            gambitCount += config.gambits.length
        }
    }
    console.log(`  ✓ ${"Ally".padEnd(10)} ${Object.keys(MOCK_CHARACTERS).length} document(s)`)
    console.log(`  ✓ ${"Gambit".padEnd(10)} ${gambitCount} document(s)`)

    console.log("Seed done.")
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
