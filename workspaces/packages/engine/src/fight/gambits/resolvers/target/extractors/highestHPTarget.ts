import { PlayingEntity } from "@fight/fight.types"

export const getHighestHpTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByHP =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.health - entityB.currentStats.health
    })

    // on récupère la dernière entité, celle avec le plus de HP
    const entitesWithHighestHP = entitiesSortedByHP.pop()
    if (! entitesWithHighestHP) 
        throw new Error("getHighestHpTarget appelé avec une liste vide")

    return entitesWithHighestHP
}