import type { Dimensions, PlayingEntityID, PlayingTeamID, Position } from "@reflexer/engine"

/** Première frame d'une spritesheet horizontale, pour un portrait statique. */
export type SpriteIcon = {
    url: string
    frames: number
    frameWidth: number
    frameHeight: number
}

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
    icon: SpriteIcon | null
}

export type LogSegmentKind = "actor" | "skill" | "target" | "plain"

export type LogSegment = {
    text: string
    kind: LogSegmentKind
    /** Portrait de l'entité (segments acteur / cible). */
    sprite?: SpriteIcon
    /** Image plate d'une action (segment compétence) ; absente → icône par défaut. */
    iconUrl?: string
}

export type CombatLogLine = {
    id: number
    segments: LogSegment[]
}

export type CombatStatus = "idle" | "playing" | "ended"

export type CombatViewState = {
    entities: Record<PlayingEntityID, EntityView>
    mapDimensions: Dimensions | null
    turnIndex: number
    currentTurnOwnerId: PlayingEntityID | null
    upcomingTurnOwners: PlayingEntityID[]
    currentAction: CombatLogLine | null
    logs: CombatLogLine[]
    status: CombatStatus
}
