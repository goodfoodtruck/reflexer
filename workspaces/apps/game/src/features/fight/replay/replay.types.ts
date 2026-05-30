import type { Position, PlayingEntityID } from "@reflexer/engine"

export type AnimationCommand =
    | DamageAnimationCommand
    | MoveAnimationCommand
    | PassiveAnimationCommand
    | DeathAnimationCommand

export type DamageAnimationCommand = {
    kind: "attack"
    sourceId: PlayingEntityID
    targetId: PlayingEntityID
    amount: number
    animationKey: string
    soundKey: string
}

export type MoveAnimationCommand = {
    kind: "move"
    entityId: PlayingEntityID
    to: Position
}

export type PassiveAnimationCommand = {
    kind: "passive"
    targetId: PlayingEntityID
    passiveId: string
}

export type DeathAnimationCommand = {
    kind: "death"
    entityId: PlayingEntityID
}