import { PlayingEntity } from "@fight/fight.types"

export const getLowestHpTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByHP =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.health - entityB.currentStats.health
    })

    // on récupère la première entité, celle avec le plus de HP
    const entitesWithLowestHP = entitiesSortedByHP.shift()
    if (! entitesWithLowestHP) 
        throw new Error("getHighestHpTarget appelé avec une liste vide")

    return entitesWithLowestHP
}