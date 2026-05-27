import { ActionLog, ExecutionContext, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { Passive, PassiveTrigger, TriggeredPassive } from "@fight/passives/passives.types";
import { GambitTargetResolver } from "@fight/gambits/resolvers/target/GambitTargetResolver";
import { ActionChainExecutor } from "./ActionChainExecutor";
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver";

export const isTriggeredPassiveOfType = (triggerType: PassiveTrigger) => {
        return (passive: Passive): passive is TriggeredPassive =>
        passive.kind === "TRIGGERED" && passive.triggerType === triggerType
}

export class EntityPassiveExecutor {

    constructor(
        private readonly triggeredPassiveResolver: TriggeredPassiveResolver,
        private readonly actionExecutor: ActionChainExecutor
    ) {}

    /**
     * Exécute les passifs d'une entité qui porte des passifs du type passé en paramètre
     * @param triggerType le type de passif à exécuter
     * @param entity l'entité dont on doit exécuter les passifs
     * @param fightContext 
     * @returns les logs de l'exécution du ou des passifs concernés
     */
    executePassiveTrigger(
        triggerType: PassiveTrigger,
        entity: PlayingEntity,
        fightContext: FightContext
    ): ActionLog[] {
        const contexts = this.triggeredPassiveResolver.resolve(triggerType, entity, fightContext, 0)
        // flatMap pour obtenir un tableau de logs à 1 dimension
        return contexts.flatMap(ctx => this.actionExecutor.execute(ctx, fightContext))
    }
}