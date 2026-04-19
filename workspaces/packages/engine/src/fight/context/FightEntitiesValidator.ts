import { PlayingEntity, PlayingTeamID } from "@fight/fight.types"

export class FightEntitiesValidator {

    validate(entities: PlayingEntity[]): void {
        this.ensureNotEmpty(entities)
        this.ensureMultipleTeams(entities)
        this.ensureTeamSizeLimit(entities)
    }

    private ensureNotEmpty(entities: PlayingEntity[]): void {
        if (entities.length === 0)
            throw new Error("Un FightContext ne peut pas être créé sans entités")
    }

    /**
     * Vérifie qu'au moins deux teams s'opposent parmi les entités joueuses
     * @param entities 
     */
    private ensureMultipleTeams(entities: PlayingEntity[]): void {
        const teams = new Set(entities.map(entity => entity.teamId))
        if (teams.size < 2)
            throw new Error("Un FightContext nécessite au moins une entité par équipe")
    }

    /**
     * Vérifie que les différentes équipes dans une liste d'entités joueuses
     * n'excèdent pas une taille de 8 membres
     * @param entities 
     */
    private ensureTeamSizeLimit(entities: PlayingEntity[]): void {
        const entitiesByTeam = entities.reduce((entitiesByTeamMap, entity) => {
            const team = entitiesByTeamMap.get(entity.teamId) ?? []
            entitiesByTeamMap.set(entity.teamId, [...team, entity])
            return entitiesByTeamMap
        }, new Map<PlayingTeamID, PlayingEntity[]>())

        for (const [teamId, teamEntities] of entitiesByTeam) {
            if (teamEntities.length > 8)
                throw new Error(`L'équipe ${teamId} ne peut pas avoir plus de 8 entités, reçu : ${teamEntities.length}`)
        }
    }
}