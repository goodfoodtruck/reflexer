import { ActionID, EntityModifiers, PlayingEntityID } from "@fight/fight.types"

export type PassiveConfigID = string

export type PassiveConfig = 
    Passive 
    & { duration: number | "PERMANENT" }

// Instance active sur l'entité — porte l'état
export type ActivePassive = {
    configId: PassiveConfigID
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
    triggerType: PassiveTrigger
    triggeredAction: ActionID
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
    modifier: EntityModifiers
}