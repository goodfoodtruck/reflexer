import type { CharacterName, EntityStats, FightEndState, FightSnapshot, Gambit, TurnLog } from "@reflexer/engine"

export type TeamMemberSnapshot = {
    characterName: CharacterName
    baseStats: EntityStats
    gambits: Gambit[]
}

export type BasePvpFight = {
    _id:            string
    playerUserId:   string
    opponentUserId: string
    winnerId:       string
    playerTeam:     TeamMemberSnapshot[]
    opponentTeam:   TeamMemberSnapshot[]
    initialState:   FightSnapshot
    endState:       FightEndState
    logs:           TurnLog[]
    createdAt:      string
}

export type FriendlyFight = BasePvpFight & { mode: "FRIENDLY" }
export type RankedFight = BasePvpFight & {
    mode: "RANKED"
    // + données sur le ranking à rajouter
}

export type PvpFight = FriendlyFight | RankedFight