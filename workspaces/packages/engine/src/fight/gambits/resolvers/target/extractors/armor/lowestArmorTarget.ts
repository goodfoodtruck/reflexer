import { PlayingEntity } from "@fight/fight.types"

export const getLowestArmorTarget = (entities: Readonly<PlayingEntity[]>): PlayingEntity => {
    const entitiesSortedByArmor =  [...entities].sort((entityA, entityB) => {
        return entityA.currentStats.armor - entityB.currentStats.armor
    })

    // on récupère la première entité, celle avec le plus d'armure
    const entitesWithLowestArmor = entitiesSortedByArmor.shift()
    if (! entitesWithLowestArmor) 
        throw new Error("getLowestArmorTarget appelé avec une liste vide")

    return entitesWithLowestArmor
}