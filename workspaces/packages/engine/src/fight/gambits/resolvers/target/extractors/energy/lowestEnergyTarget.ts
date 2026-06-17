import { PlayingEntity } from "@fight/fight.types"

export const getLowestEnergyTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByEnergy =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.energy - entityB.currentStats.energy
    })

    // on récupère la première entité, celle avec le moins d'énergie
    const entityWithLowestEnergy = entitiesSortedByEnergy.shift()
    if (! entityWithLowestEnergy) 
        throw new Error("getLowestEnergyTarget appelé avec une liste vide")

    return entityWithLowestEnergy
}