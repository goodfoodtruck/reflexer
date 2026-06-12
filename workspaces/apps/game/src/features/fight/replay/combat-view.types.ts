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

/** Portrait + libellé d'une entité (acteur ou cible). */
export type LogActor = {
    label: string
    sprite?: SpriteIcon
}

/** Compétence/action jouée : libellé + image (absente → icône par défaut). */
export type LogSkill = {
    label: string
    iconUrl?: string
}

/** Montant chiffré d'un effet, coloré selon son signe. */
export type LogAmount = {
    kind: "damage" | "heal"
    text: string
}

export type CombatLogLine = {
    id: number
    actor: LogActor | null
    verb: string
    skill: LogSkill | null
    target: LogActor | null
    amount: LogAmount | null
}

export type CombatStatus = "idle" | "playing" | "ended"

export type CombatViewState = {
    entities: Record<PlayingEntityID, EntityView>
    mapDimensions: Dimensions | null
    turnIndex: number
    currentTurnOwnerId: PlayingEntityID | null
    upcomingTurnOwners: PlayingEntityID[]
    turnOrder: PlayingEntityID[]
    currentAction: CombatLogLine | null
    logs: CombatLogLine[]
    status: CombatStatus
}
