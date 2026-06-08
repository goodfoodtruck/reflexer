import { Action } from "@fight/fight.types"
import actionsJson from "./json/actions.json"

/**
 * Identifiants des actions (en attendant une vraie source persistée).
 * Référencés par les gambits et par les actions déclenchées des passifs
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
 * Actions : source de vérité dans `json/actions.json` (gameplay + présentation
 * `name`/`icon`), seed de `InMemoryActionRegistry`. Le cast est la frontière de
 * confiance entre le JSON (types larges : `string`, `number`) et le modèle
 * `Action` (unions précises comme `duration: number | "PERMANENT"`).
 */
export const MOCK_ACTIONS = actionsJson as unknown as readonly Action[]
