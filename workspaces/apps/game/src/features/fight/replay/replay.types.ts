import type { Position, PlayingEntityID } from "@reflexer/engine"

export type AnimationCommand =
    | DamageAnimationCommand
    | MoveAnimationCommand
    | StatusAnimationCommand
    | DeathAnimationCommand

type DamageAnimationCommand = {
    kind: "attack"
    sourceId: PlayingEntityID
    targetId: PlayingEntityID
    amount: number
    animationKey: string
    soundKey: string
}

type MoveAnimationCommand = {
    kind: "move"
    entityId: PlayingEntityID
    to: Position
}

type StatusAnimationCommand = {
    kind: "status"
    targetId: PlayingEntityID
    effectKey: string
}

type DeathAnimationCommand = {
    kind: "death"
    entityId: PlayingEntityID
}