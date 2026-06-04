import { ETargetType } from "@fight/gambits/gambits.types"
import { Passive, PassiveID } from "@fight/passives/passives.types"
import {
    BLEED_PASSIVE_ID,
    BLEED_TICK_ACTION_ID,
    THORNS_PASSIVE_ID,
    THORNS_TICK_ACTION_ID,
    VULNERABLE_PASSIVE_ID,
} from "./mockActions"

/**
 * Passifs mockés (en attendant une vraie source persistée). Seed de
 * `InMemoryPassiveRegistry`. Trois mécaniques pour stresser les logs :
 *
 * - `bleed`    : passif déclenché en début de tour, fait saigner le porteur
 *                (dégâts sur soi), cumulable jusqu'à 3 fois.
 * - `vulnerable`: modificateur passif, +50% de dégâts reçus tant qu'actif.
 * - `thorns`   : passif déclenché quand le porteur subit des dégâts, riposte
 *                sur un ennemi (réaction → `reactionDepth` > 0).
 */
export const MOCK_PASSIVES: Record<PassiveID, Passive> = {
    [BLEED_PASSIVE_ID]: {
        id: BLEED_PASSIVE_ID,
        kind: "TRIGGERED",
        config: { duration: 3, applicationStrategy: { type: "STACK", maxStack: 3 } },
        triggerType: "turn_start",
        triggeredActionId: BLEED_TICK_ACTION_ID,
        targetSelector: { context: { targetType: ETargetType.SELF }, sort: "LOWEST_HP" },
    },
    [VULNERABLE_PASSIVE_ID]: {
        id: VULNERABLE_PASSIVE_ID,
        kind: "MODIFIER",
        config: { duration: 3, applicationStrategy: { type: "RESET" } },
        modifier: "damageReceivedModifier",
        value: 50,
    },
    [THORNS_PASSIVE_ID]: {
        id: THORNS_PASSIVE_ID,
        kind: "TRIGGERED",
        config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
        triggerType: "damage_dealt",
        triggeredActionId: THORNS_TICK_ACTION_ID,
        targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "HIGHEST_HP" },
    },
}
