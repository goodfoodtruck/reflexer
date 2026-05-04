import { IStatus } from "@fight/context/IStatus";
import { HasStatusFilter } from "@fight/gambits/entityFilters.types";
import { evaluateHasStatus } from "@fight/turn-resolvers/filters/evaluators/HasStatusEvaluator";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Vérifier si l'entité est affectée par un status en particulier", () => {

    it("Retourne true si l'entité est bien affectée par le status", () => {
        const poisonStatus: IStatus = { id: "POISON", stacks: 1, remainingTurns: 2 }
        const hasPoisonStatusFilter: HasStatusFilter = { type: "HAS_STATUS", status: poisonStatus }

        // le joueur est affecté par le statut POISON
        const player_affected = buildPlayingEntity({ id: "player_poisoned", statuses: [poisonStatus] })
        // inutile pour le test, juste pour instancier un fight context
        const enemy = buildPlayingEntity({ id: "enemy_1" })

        const context = buildFightContext([player_affected], [enemy])
        
        expect(evaluateHasStatus(player_affected, hasPoisonStatusFilter, context)).toBe(true)
    })

    it("Retourne false si l'entité n'est pas affectée par le status", () => {
        // le joueur n'est affecté par aucun statut
        const player = buildPlayingEntity({ id: "player_without_status" })
        // inutile pour le test, juste pour instancier un fight context
        const enemy = buildPlayingEntity({ id: "enemy_1" })

        const context = buildFightContext([player], [enemy])
        const poisonStatus: IStatus = { id: "POISON", stacks: 1, remainingTurns: 2 }
        const hasPoisonStatusFilter: HasStatusFilter = { type: "HAS_STATUS", status: poisonStatus }
        
        expect(evaluateHasStatus(player, hasPoisonStatusFilter, context)).toBe(false)
    })
})