import { ActionLog, TurnLog } from "./fight.types";

export class FightLogger {

    private logs: TurnLog[] = []

    constructor() {}

    record(log: TurnLog): void {
        this.logs = [...this.logs, log]
    } 

    getLogs(): TurnLog[] {
        return this.logs
    }

    getActionLogs(): ActionLog[] {
        return this.getLogs().flatMap(l => l.actionLogs)
    }

    hashTurn(turnLog: TurnLog): string {
        const hashedActions = turnLog.actionLogs.map(log => {
            switch (log.type) {
                case "damage_dealt":    return `damage_dealt:${log.sourceId}:${log.targetId}`
                case "entity_moved":    return `entity_moved:${log.entityId}:${log.cell.x}:${log.cell.y}`
                case "action_failed":   return `action_failed:${log.reason}`
                case "damage_skipped":  return `damage_skipped:${log.targetId}:${log.reason}`
                case "entity_died":     return `entity_died:${log.entityId}`
                case "passive_applied": return `passive_applied:${log.passiveId}:${log.sourceId}:${log.targetId}`
            }
        })
        return `${hashedActions.join(";")}`
    }
}