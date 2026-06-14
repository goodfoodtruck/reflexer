import mongoose from "mongoose"
import { MOCK_CHARACTERS, type CharacterName } from "@reflexer/engine"
import { UserModel } from "@models/user.model"
import { CharacterModel } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import { UserRankingModel } from "@models/ranked/user_ranking.model"

// Personnages jouables (les autres entrées de MOCK_CHARACTERS sont des ennemis).
const PLAYABLE: CharacterName[] = ["CHARACTER_1", "CHARACTER_2"]

// Deux joueurs (combat amical PVP). IDs FIXES : ils sont référencés en dur dans
// le .env du front (VITE_FRIENDLY_PLAYER_ID / VITE_FRIENDLY_OPPONENT_ID). Les
// figer garantit que le front continue de marcher même si la base est wipée.
export const SEED_USERS = [
    { id: new mongoose.Types.ObjectId("000000000000000000000001"), name: "Player One" },
    { id: new mongoose.Types.ObjectId("000000000000000000000002"), name: "Player Two" },
]

/**
 * Seed idempotent des données de combat (users + characters + gambits). Conçu
 * pour être (ré)exécuté à chaque démarrage du serveur : si la base est vide il
 * la repeuple, sinon il remet les gambits en cohérence avec les characters.
 */
export async function seedDatabase(): Promise<void> {
    // 1. Users à _id fixes (+ purge d'éventuels doublons par nom hérités d'un
    //    ancien seed à _id auto-généré).
    for (const user of SEED_USERS) {
        await UserModel.findByIdAndUpdate(user.id, { $set: { name: user.name } }, { upsert: true })
        await UserRankingModel.create({ userId: user.id })
    }
    await UserModel.deleteMany({
        name: { $in: SEED_USERS.map(u => u.name) },
        _id:  { $nin: SEED_USERS.map(u => u.id) },
    })

    // 2. Characters — upsert par nom (on conserve les _id existants).
    const charactersByName = new Map<CharacterName, mongoose.Types.ObjectId>()
    for (const characterName of PLAYABLE) {
        const character = await CharacterModel.findOneAndUpdate(
            { characterName },
            { $set: { characterName, baseStats: MOCK_CHARACTERS[characterName].baseStats } },
            { upsert: true, new: true }
        )
        charactersByName.set(characterName, character!._id as mongoose.Types.ObjectId)
    }

    // 3. Gambits — repris de MOCK_CHARACTERS pour chaque (user, character). On
    //    repart de zéro pour les users seedés afin de rester cohérent avec les
    //    characterId courants.
    await GambitModel.deleteMany({ userId: { $in: SEED_USERS.map(u => u.id) } })
    const gambitDocs = SEED_USERS.flatMap(user =>
        PLAYABLE.flatMap(characterName =>
            MOCK_CHARACTERS[characterName].gambits.map(gambit => ({
                userId:         user.id,
                characterId:    charactersByName.get(characterName)!,
                name:           gambit.id,
                priority:       gambit.priority,
                conditions:     gambit.conditions,
                targetSelector: gambit.targetSelector,
                intent:         gambit.intent,
            }))
        )
    )
    if (gambitDocs.length > 0) await GambitModel.insertMany(gambitDocs)
}
