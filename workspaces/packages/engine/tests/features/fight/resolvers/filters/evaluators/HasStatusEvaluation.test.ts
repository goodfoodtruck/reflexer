import { IStatus } from "@fight/context/IStatus";
import { PlayingEntity } from "@fight/fight.types";
import { HasStatusFilter } from "@fight/gambits/resolvers/filters/entityFilters.types";
import { evaluateHasStatus } from "@fight/gambits/resolvers/filters/evaluators/HasStatusEvaluator";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Vérifier si l'entité est affectée par un statut en particulier", () => {

    const poison: IStatus = { id: "POISON", stacks: 1, remainingTurns: 2 }
    const burn: IStatus   = { id: "BURN",   stacks: 1, remainingTurns: 2 }
    const hasPoisonFilter: HasStatusFilter = { type: "HAS_STATUS", status: poison }

    const buildContext = (player: PlayingEntity) => {
        const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
        return buildFightContext([player], [enemy])
    }

    it("Retourne true si l'entité est affectée par le statut", () => {
        const player = buildPlayingEntity({ id: "player", statuses: [poison] })
        expect(evaluateHasStatus(player, hasPoisonFilter, buildContext(player))).toBe(true)
    })

    it("Retourne true si l'entité a plusieurs statuts dont celui recherché", () => {
        const player = buildPlayingEntity({ id: "player", statuses: [poison, burn] })
        expect(evaluateHasStatus(player, hasPoisonFilter, buildContext(player))).toBe(true)
    })

    it("Retourne false si l'entité n'a aucun statut", () => {
        const player = buildPlayingEntity({ id: "player", statuses: [] })
        expect(evaluateHasStatus(player, hasPoisonFilter, buildContext(player))).toBe(false)
    })

    it("Retourne false si l'entité a des statuts mais pas celui recherché", () => {
        const player = buildPlayingEntity({ id: "player", statuses: [burn] })
        expect(evaluateHasStatus(player, hasPoisonFilter, buildContext(player))).toBe(false)
    })
})