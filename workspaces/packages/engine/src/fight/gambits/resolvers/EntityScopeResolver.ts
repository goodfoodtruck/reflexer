import { IFightContextReader } from "@fight/context/IFightContextReader"
import { PlayingEntity } from "@fight/fight.types"
import { ETargetType } from "@fight/gambits/gambits.types"

export class EntityScopeResolver {

    /**
     * 
     * @param scope Le type d'entité concerné
     * @param entity entité qui joue son tour
     * @param context 
     * @returns 
     */
    resolveScope(
        scope: ETargetType,
        entity: PlayingEntity,
        context: IFightContextReader
    ): PlayingEntity[] {
        switch (scope) {
            case ETargetType.SELF:  return [entity]
            case ETargetType.ALLY:  return context.getAllies(entity)
            case ETargetType.ENEMY: return context.getEnemies(entity)
        }
    }
}