import type { PlayingEntityID, PlayingTeamID, Position } from "@reflexer/engine"

export type EntityView = {
    id: PlayingEntityID
    label: string
    teamId: PlayingTeamID
    position: Position
    hp: number
    maxHp: number
    energy: number
    maxEnergy: number
    alive: boolean
}

export type LogSegmentKind = "actor" | "skill" | "target" | "plain"

export type LogSegment = {
    text: string
    kind: LogSegmentKind
}

export type CombatLogLine = {
    id: number
    segments: LogSegment[]
}

export type CombatStatus = "idle" | "playing" | "ended"

export type CombatViewState = {
    entities: Record<PlayingEntityID, EntityView>
    turnIndex: number
    currentTurnOwnerId: PlayingEntityID | null
    upcomingTurnOwners: PlayingEntityID[]
    currentAction: CombatLogLine | null
    logs: CombatLogLine[]
    status: CombatStatus
}
