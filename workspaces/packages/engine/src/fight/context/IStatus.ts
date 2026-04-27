import { QueuedProcessor } from "@processors/processor.types";
import {
    DamageDealtEvent,
    DamageReceivedEvent,
    PlayingEntityID,
    StatusID,
    TurnEvent
} from "@fight/fight.types";

export interface IStatus {
    readonly id: StatusID           // identifiant du type de statut ('thorns', 'poison'…)
    readonly stacks: number          // niveau / cumul (1 pour les statuts non-cumulables)
    readonly remainingTurns: number | null  // null = permanent, number = expire

    // Hooks réactifs — tous optionnels
    // Retournent un QueuedProcessor à pousser, ou null si rien à déclencher
    onDamageReceived?(event: DamageReceivedEvent): QueuedProcessor | null
    onDamageDealt?(event: DamageDealtEvent): QueuedProcessor | null
    onTurnStart?(event: TurnEvent): QueuedProcessor | null
    onTurnEnd?(event: TurnEvent): QueuedProcessor | null
    onAttach?(ownerId: PlayingEntityID): QueuedProcessor | null
    onDetach?(ownerId: PlayingEntityID): QueuedProcessor | null
}