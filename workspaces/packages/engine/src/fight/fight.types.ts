import { Gambit } from "@gambits/gambits.types"
import { Position } from "@helpers/types/helpers.types"

export type PlayingEntity = {
    id: PlayingEntityID
    health: number
    maxHealth: number
    energy: number
    maxEnergy: number
    gambits: Gambit[]
    position: Position
}

export type PlayingEntityID = string
export type PassiveEffectID = string


