import type { ActionLog, FightResult } from "@reflexer/engine";
import type { LogInterpreter } from "./LogInterpreter.ts";
import type { AnimationQueue } from "./AnimationQueue.ts";
import type { CombatScene } from "../rendering/CombatScene.ts";
import type { CombatViewStore } from "./CombatViewStore.ts";
import { buildEntityLabels, formatActionLog } from "./log-format.ts";

export class CombatReplayer {
    constructor(
        private readonly scene: CombatScene,
        private readonly interpreter: LogInterpreter,
        private readonly animationQueue: AnimationQueue,
        private readonly store: CombatViewStore
    ) {}

    async play(result: FightResult): Promise<void> {
        this.scene.setup(result.initialState)

        const labels = buildEntityLabels(result.initialState.entities)
        this.store.initialize(result.initialState, labels)

        let lineId = 0
        const turns = result.logs

        for (let t = 0; t < turns.length; t++) {
            const turn = turns[t]
            const upcoming = turns.slice(t + 1).map(next => next.ownerId)
            this.store.beginTurn(turn.turnIndex, turn.ownerId, upcoming)

            for (const log of turn.actionLogs) {
                const line = formatActionLog(log, labels, lineId)
                if (line) {
                    this.store.pushAction(line)
                    lineId++
                }

                const command = this.interpreter.interpret(log)
                if (command) await this.animationQueue.run(command)

                this.applyStateChange(log)
            }
        }

        this.store.finish()
    }

    /** Répercute l'effet du log sur l'état de vue, après son animation. */
    private applyStateChange(log: ActionLog): void {
        switch (log.type) {
            case "damage_dealt":
                this.store.applyDamage(log.targetId, log.amount)
                break
            case "entity_died":
                this.store.killEntity(log.entityId)
                break
            case "entity_moved":
                this.store.moveEntity(log.entityId, log.cell)
                break
        }
    }
}
