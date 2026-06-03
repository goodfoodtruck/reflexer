import { describe, it, expect } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { ExecutionState } from "@fight/fight.types"
import { makeActionCtx } from "@tests/helpers/makeCtx"
import { DamageApplyProcessor } from "@fight/processors/damage/DamageApplyProcessor"

describe("DamageApplyProcessor", () => {

    const ctx = makeActionCtx({ casterId: "player_0", targetId: "enemy_0" })

    it("applique les dégâts calculés sur la cible", () => {
        const fightContext = buildFightContext([{}], [{}])
        const processor = new DamageApplyProcessor()

        const execState: ExecutionState = { computedDamage: 15, computedHeal: 0 }
        processor.execute(ctx, execState, fightContext)

        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(85)
    })
})
