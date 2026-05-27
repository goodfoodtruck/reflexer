import { ActionID, ActionLog, EntityModifiers, PlayingEntityID } from "@fight/fight.types"
import { TargetSelector } from "@fight/gambits/gambits.types"

export type PassiveConfigID = string

export type PassiveConfig = 
    Passive 
    & { duration: number | "PERMANENT" }

// Instance active sur l'entité — porte l'état
export type ActivePassive = {
    passive: Passive
    remainingTurns: number | "PERMANENT"    // combien de tours actifs
    sourceEntityId: PlayingEntityID         // qui a appliqué ce passif
}

/** 
 * Un passif peut être soit un effet qui se déclenche en réaction
 * à quelque chose (dégats reçus, soins reçus... etc)
 * soit un modificateur qui va s'appliquer sur l'entité qui a ce passif 
 * (dégats subits réduits de 30%, dégats infligés augmentés de 10%...etc), tant que celui-ci est actif
 */
export type Passive = 
    | TriggeredPassive
    | ModifierPassive

/** Un passif porté par une entité peut-être déclenché par un évènement */
export type TriggeredPassive = {
    kind: "TRIGGERED"
    triggerType: PassiveTrigger    // type de déclencheur
    triggeredActionId: ActionID      // action a exécuté lorsque le passif est déclenché
    targetSelector: TargetSelector // sur qui l'action déclenchée va s'appliquer
}

export type PassiveTrigger =
    | "ON_TURN_START" 
    | "ON_TURN_END"
    | "ON_DAMAGE_RECEIVED"
    | "ON_DEATH"


/** Un passif porté par une entité peut apporter une modification sur son prochain tour
 * ou jusqu'à la fin du combat, la temporalité est portée par le type ActionPassive
 * (dégats, réduction de dégats... etc)
 */
export type ModifierPassive = {
    kind: "MODIFIER"
    /** Type de modification, une modification de stat par passif.
     * Pour une attaque qui appliquerait deux modifications de stats par exemple, on appliquerait
     * deux passifs distincts à l'entité
    */
    modifier: keyof EntityModifiers
    /** valeur en pourcentage, par exemple si modifier est 'damageDealtModifier', alors une valeur à 10 représentera 10% de dommages infligés supplémentaires */
    value: number                   
}


export const EVENT_TO_TRIGGER: Partial<Record<ActionLog["type"], PassiveTrigger>> = {
    "damage_dealt": "ON_DAMAGE_RECEIVED",
    "entity_died":     "ON_DEATH",
}