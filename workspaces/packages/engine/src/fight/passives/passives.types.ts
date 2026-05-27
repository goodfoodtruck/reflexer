import { ActionID, ActionLog, EntityModifiers, PlayingEntityID } from "@fight/fight.types"
import { TargetSelector } from "@fight/gambits/gambits.types"

export type PassiveID = string

export type PassiveConfig = {
    readonly duration: number | "PERMANENT"
    readonly applicationStrategy: PassiveApplicationStrategy
}

type BasePassive = {
    readonly id: PassiveID
    readonly config: PassiveConfig
}

/**
 * De quelle façon le passif s'applique
 * - STACK: le passif peut-être cumulé maxStack fois sur une même cible
 * - RESET: appliquer ce passif reset le nombre de tour restant pour ce passif
 */
export type PassiveApplicationStrategy = 
    | { readonly type: "STACK", readonly maxStack: number }
    | { readonly type: "RESET" }

// Instance active sur l'entité — porte l'état
export type ActivePassive = {
    readonly passive: Passive
    remainingTurns: number | "PERMANENT"   // combien de tours actifs
    readonly sourceEntityId: PlayingEntityID        // qui a appliqué ce passif
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
export type TriggeredPassive = BasePassive & {
    readonly kind: "TRIGGERED"
    readonly triggerType: PassiveTrigger    // type de déclencheur
    readonly triggeredActionId: ActionID    // action a exécuter lorsque le passif est déclenché
    readonly targetSelector: TargetSelector // sur qui l'action déclenchée va s'appliquer
}

export type PassiveTrigger = Readonly<ActionLog["type"]>


/** Un passif porté par une entité peut apporter une modification sur son prochain tour
 * ou jusqu'à la fin du combat, la temporalité est portée par le type ActionPassive
 * (dégats, réduction de dégats... etc)
 */
export type ModifierPassive = BasePassive & {
    readonly kind: "MODIFIER"
    /** Type de modification, une modification de stat par passif.
     * Pour une attaque qui appliquerait deux modifications de stats par exemple, on appliquerait
     * deux passifs distincts à l'entité
    */
    readonly modifier: keyof EntityModifiers
    /** valeur en pourcentage, par exemple si modifier est 'damageDealtModifier', alors une valeur à 10 représentera 10% de dommages infligés supplémentaires */
    readonly value: number                   
}