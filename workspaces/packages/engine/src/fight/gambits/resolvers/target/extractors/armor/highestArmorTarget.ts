import { PlayingEntity } from "@fight/fight.types"

export const getHighestArmorTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByArmor =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.armor - entityB.currentStats.armor
    })

    // on récupère la dernière entité, celle avec le plus d'armure
    const entitesWithHighestArmor = entitiesSortedByArmor.pop()
    if (! entitesWithHighestArmor) 
        throw new Error("getHighestArmorTarget appelé avec une liste vide")

    return entitesWithHighestArmor
}