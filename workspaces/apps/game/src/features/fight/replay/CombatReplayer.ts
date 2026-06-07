import type { ActionLog, EntitySnapshot, FightResult, ICharacterRegistry, IFightMapRegistry, PlayingEntityID } from "@reflexer/engine";
import type { Dispatch } from "react";
import type { AnimationQueue } from "./AnimationQueue.ts";
import type { CombatScene } from "../rendering/CombatScene.ts";
import type { CombatAction } from "./combat-view.reducer.ts";
import { formatActionLog } from "./log-format.ts";

/**
 * Cadence du combat (façon FF Tactics) : des temps morts délibérés autour de
 * chaque action pour qu'on ait le temps de tout lire, au lieu d'enchaîner les
 * animations. Toutes les valeurs sont en millisecondes — point unique de réglage.
 */
const PACING = {
    /** Après le début d'un tour : laisser voir quelle unité s'active. */
    turnIntroMs: 500,
    /** Après l'annonce de l'action, avant son animation : laisser la lire. */
    actionLeadMs: 400,
    /** Après l'animation + l'effet : laisser le résultat se poser (PV, etc.). */
    actionSettleMs: 500,
    /** Avant de passer au tour suivant : une respiration. */
    turnOutroMs: 350,
} as const

export class CombatReplayer {
    constructor(
        private readonly scene: CombatScene,
        private readonly animationQueue: AnimationQueue,
        private readonly dispatch: Dispatch<CombatAction>,
        private readonly mapRegistry: IFightMapRegistry,
        private readonly characterRegistry: ICharacterRegistry
    ) {}

    async play(result: FightResult): Promise<void> {
        const map = this.mapRegistry.getConfig(result.initialState.mapId)
        await this.scene.setup(result.initialState, map, entity => this.characterRegistry.getConfig(entity.name).visual)

        const labels = this.buildLabels(result.initialState.entities)
        this.dispatch({ type: "initialize", snapshot: result.initialState, labels, mapDimensions: map.dimensions })

        let lineId = 0
        const turns = result.logs

        for (let t = 0; t < turns.length; t++) {
            const turn = turns[t]
            const upcoming = turns.slice(t + 1).map(next => next.ownerId)
            this.dispatch({ type: "beginTurn", turnIndex: turn.turnIndex, ownerId: turn.ownerId, upcomingTurnOwners: upcoming })
            await this.scene.wait(PACING.turnIntroMs)

            for (const log of turn.actionLogs) {
                const line = formatActionLog(log, labels, lineId)
                if (line) {
                    this.dispatch({ type: "pushAction", line })
                    lineId++
                    await this.scene.wait(PACING.actionLeadMs)
                }

                await this.animationQueue.play(log)

                this.applyStateChange(log)
                if (line) await this.scene.wait(PACING.actionSettleMs)
            }

            await this.scene.wait(PACING.turnOutroMs)
        }

        this.dispatch({ type: "finish" })
    }

    /** Libellé affichable de chaque entité, résolu depuis son identité (`name`). */
    private buildLabels(entities: EntitySnapshot[]): Map<PlayingEntityID, string> {
        const labels = new Map<PlayingEntityID, string>()
        for (const entity of entities) {
            labels.set(entity.id, this.characterRegistry.getConfig(entity.name).name)
        }
        return labels
    }

    /** Répercute l'effet du log sur l'état de vue, après son animation. */
    private applyStateChange(log: ActionLog): void {
        switch (log.type) {
            case "damage_dealt":
                this.dispatch({ type: "applyDamage", targetId: log.targetId, amount: log.amount })
                break
            case "entity_died":
                this.dispatch({ type: "killEntity", entityId: log.entityId })
                break
            case "entity_moved":
                this.dispatch({ type: "moveEntity", entityId: log.entityId, position: log.cell })
                break
        }
    }
}
