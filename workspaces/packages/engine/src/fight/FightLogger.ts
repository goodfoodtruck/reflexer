import { TurnLog } from "./fight.types";

export class FightLogger {

    private logs: TurnLog[] = []

    constructor() {}

    record(log: TurnLog): void {
        this.logs = [...this.logs, log]
    } 

    getLogs(): TurnLog[] {
        return this.logs
    }
}