import { Action } from "@fight/fight.types"

/**
 * Identifiants des actions mockées (en attendant une vraie source persistée).
 * Référencés par les gambits et par les actions déclenchées des passifs.
 */
export const ATTACK_ACTION_ID = "attack"
export const HEAVY_ATTACK_ACTION_ID = "heavy_attack"
export const ATTACK_BLEED_ACTION_ID = "attack_bleed"
export const BLEED_TICK_ACTION_ID = "bleed_tick"
export const CURSE_ACTION_ID = "curse"
export const THORNS_TICK_ACTION_ID = "thorns_tick"
export const APPLY_THORNS_ACTION_ID = "apply_thorns"

export const BLEED_PASSIVE_ID = "bleed"
export const VULNERABLE_PASSIVE_ID = "vulnerable"
export const THORNS_PASSIVE_ID = "thorns"

/**
 * Actions mockées : seed de `InMemoryActionRegistry`. Un processeur `damage`
 * inflige des dégâts ; un processeur `passive` applique un passif à la cible.
 * Une action peut combiner les deux (ex. `attack_bleed`).
 */
export const MOCK_ACTIONS: readonly Action[] = [
    {
        id: ATTACK_ACTION_ID,
        type: "attack",
        processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 18 } }],
    },
    {
        id: HEAVY_ATTACK_ACTION_ID,
        type: "attack",
        processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 40 } }],
    },
    {
        id: ATTACK_BLEED_ACTION_ID,
        type: "attack",
        processorConfigs: [
            { type: "damage", order: 1, params: { damage_value: 12 } },
            { type: "passive", order: 2, params: { passiveId: BLEED_PASSIVE_ID, duration: 3 } },
        ],
    },
    {
        id: BLEED_TICK_ACTION_ID,
        type: "attack",
        processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 8 } }],
    },
    {
        id: CURSE_ACTION_ID,
        type: "passive",
        processorConfigs: [{ type: "passive", order: 1, params: { passiveId: VULNERABLE_PASSIVE_ID, duration: 3 } }],
    },
    {
        id: THORNS_TICK_ACTION_ID,
        type: "attack",
        processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }],
    },
    {
        id: APPLY_THORNS_ACTION_ID,
        type: "passive",
        processorConfigs: [{ type: "passive", order: 1, params: { passiveId: THORNS_PASSIVE_ID, duration: "PERMANENT" } }],
    },
]
