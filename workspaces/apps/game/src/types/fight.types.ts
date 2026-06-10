import type { CharacterName, EntityStats, FightEndState, FightMapID, FightSnapshot, Gambit, TurnLog } from "@reflexer/engine"

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
    endState:       FightEndState
    fightMapId:     FightMapID
    initialState:   FightSnapshot,
    logs:           TurnLog[]
}