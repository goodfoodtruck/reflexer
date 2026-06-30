import { TeamRepository } from "@repositories/team.repository"
import { GambitRepository } from "@repositories/gambit.repository"
import { CharacterRepository } from "@repositories/character.repository"
import type { CharacterDocument } from "@models/character.model"
import type { Gambit, TeamMemberData } from "@reflexer/engine"

export class TeamService {
    constructor(
        private readonly teamRepo: TeamRepository,
        private readonly gambitRepo: GambitRepository,
        private readonly characterRepo: CharacterRepository
    ) {}

    async getTeamByUserId(userId: string) {
        return this.teamRepo.findByUserId(userId)
    }

    async upsertTeam(userId: string, characterIds: string[]) {
        const validCount = await this.characterRepo.countByIds(characterIds)
        if (validCount !== 2) throw Object.assign(
            new Error("Un ou plusieurs personnages sont introuvables"),
            { status: 400 }
        )
        return this.teamRepo.upsert(userId, { characterIds })
    }

    async getTeamReadiness(userId: string) {
        const team = await this.teamRepo.findByUserId(userId)
        if (!team) return { ready: false, missingCharacterNames: [] }

        const characters = team.characterIds as unknown as CharacterDocument[]
        const missingCharacterNames: string[] = []

        for (const character of characters) {
            const count = await this.gambitRepo.countByUserAndCharacter(userId, character._id)
            if (count === 0) missingCharacterNames.push(character.characterName)
        }

        return { ready: missingCharacterNames.length === 0, missingCharacterNames }
    }

    async buildTeamFromUserId(userId: string): Promise<TeamMemberData[]> {
        const team = await this.teamRepo.findByUserId(userId)
        if (!team) return []

        const characters = team.characterIds as unknown as CharacterDocument[]

        return Promise.all(
            characters.map(async (character) => {
                const gambits = await this.gambitRepo.findByUserAndCharacter(userId, character._id)

                return {
                    characterName: character.characterName,
                    characterTag: character.slug,
                    baseStats: character.baseStats,
                    activePassiveIds: [],
                    gambits: gambits.map((g: any) => ({
                        ...g,
                        id: g._id.toString()
                    })) as Gambit[]
                }
            })
        )
    }
}
