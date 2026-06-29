import { PlayingEntity } from "@fight/fight.types"

export const getHighestEnergyTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByEnergy =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.health - entityB.currentStats.health
    })

    // on récupère la dernière entité, celle avec le plus d'énergie
    const entityWithHighestEnergy = entitiesSortedByEnergy.pop()
    if (! entityWithHighestEnergy) 
        throw new Error("getHighestEnergyTarget appelé avec une liste vide")

    return entityWithHighestEnergy
}