import { IActionRegistry } from "@data/IActionRegistry";
import { IPassiveRegistry } from "@data/IPassiveRegistry";
import { Action, ActionID } from "@fight/fight.types";
import { EntityScopeResolver, ETargetType, FilterApplier, FilterEvaluatorRegistry, GambitTargetResolver } from "@fight/gambits";
import { PassiveConfig } from "@fight/passives/passives.types";
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver";
import { ProcessorFactory, ProcessorChain } from "@fight/processors";
import { ActionChainExecutor } from "@fight/turn-executors";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Exécuter une action et gérer ses effets de bord", () => {

    const buildExecutor = (overrides: {
        actionRegistry?: IActionRegistry
        targetResolver?: GambitTargetResolver
        passiveRegistry?: IPassiveRegistry
    } = {}) => {
        const filterEvaluatorRegistry = new FilterEvaluatorRegistry()
        const filterApplier = new FilterApplier(filterEvaluatorRegistry)
        const entityScopeResolver = new EntityScopeResolver()

        const passiveRegistry = overrides.passiveRegistry ?? { getPassive: () => { throw new Error("not implemented") } }
        const actionRegistry  = overrides.actionRegistry  ?? { get: () => { throw new Error("action not found") } }
        const targetResolver  = overrides.targetResolver  ?? new GambitTargetResolver(filterApplier, entityScopeResolver)

        const processorFactory = new ProcessorFactory(passiveRegistry)
        const processorChain   = new ProcessorChain()

        const triggeredPassiveResolver = new TriggeredPassiveResolver(targetResolver)

        return new ActionChainExecutor(
            processorFactory,
            actionRegistry,
            triggeredPassiveResolver,
            processorChain
        )
    }
    
    it("exécute une action simple sans réaction", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "damage", order: 1, params: { damage_value: 10 } }
            ]
        }

        const executor = buildExecutor({
            actionRegistry: { get: () => basicAttack }
        })

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const fightContext = buildFightContext([mage], [gobelin])

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs).toHaveLength(1)
        expect(logs[0]?.type).toBe("damage_dealt")
    })

    it("déclenche une réaction THORNS quand la cible reçoit des dégâts", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "damage", order: 1, params: { damage_value: 10 } }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "damage", order: 1, params: { damage_value: 3 } }
            ]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: {
                context: { targetType: ETargetType.ENEMY, filters: [] },
                sort: "LOWEST_HP"
            },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")        return basicAttack
                if (id === "thorns_retaliation")  return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const executor = buildExecutor({ actionRegistry })

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{
                passive: thornsPassive,
                remainingTurns: "PERMANENT",
                sourceEntityId: "gobelin"
            }]
        })

        const fightContext = buildFightContext([mage], [gobelin])

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

            // l'attaque du mage sur le gobelin
        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin",
            amount: 10
        })

        // la riposte THORNS du gobelin sur le mage
        expect(logs[1]).toMatchObject({
            type: "damage_dealt",
            sourceId: "gobelin",
            targetId: "mage",
            amount: 3
        })

        // les HP du mage ont effectivement baissé
        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.currentStats.health).toBe(mage.baseStats.health - 3)
    })


    it("arrête la chaîne de réactions au-delà de MAX_REACTION_DEPTH", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 5 } }]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 2 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        // les deux entités ont THORNS
        const mage = buildPlayingEntity({
            id: "mage",
            teamId: "PLAYER",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "mage" }]
        })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        // mage → gobelin (attaque)         depth 0
        // gobelin → mage (thorns)          depth 1
        // mage → gobelin (thorns du mage)  depth 2 — STOPPÉ si MAX = 1
        // OU exécuté si MAX = 2
        
        // avec MAX_REACTION_DEPTH = 1, on attend exactement 2 logs
        expect(logs).toHaveLength(2)
        expect(logs[0]).toMatchObject({ sourceId: "mage",    targetId: "gobelin", amount: 5 })
        expect(logs[1]).toMatchObject({ sourceId: "gobelin", targetId: "mage",    amount: 2 })
    })

    it("déclenche un passif ON_DEATH quand l'entité meurt", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 100 } }]
        }

        const deathExplosion: Action = {
            id: "death_explosion",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 5 } }]
        }

        const explosionPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DEATH",
            triggeredActionId: "death_explosion",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")    return basicAttack
                if (id === "death_explosion") return deathExplosion
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: explosionPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const initialMageHealth = mage.currentStats.health

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        // attaque mortelle du mage sur gobelin
        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin"
        })

        // explosion du gobelin mort sur le mage
        const explosionLog = logs.find(log => 
            log.type === "damage_dealt" && log.sourceId === "gobelin" && log.targetId === "mage"
        )
        expect(explosionLog).toBeDefined()
        expect(explosionLog).toMatchObject({ amount: 5 })

        // le mage a effectivement subi les dégâts d'explosion
        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.currentStats.health).toBe(initialMageHealth - 5)
    })

    it("ne déclenche pas de réaction si la cible ne peut être résolue", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        // passif THORNS qui cible un allié — mais le gobelin n'a aucun allié
        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: {
                context: { targetType: ETargetType.ALLY, filters: [] },  // cible un allié
                sort: "LOWEST_HP"
            },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })

        // un seul gobelin sans allié — le passif ne peut résoudre aucune cible
        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        // une seule action exécutée, pas de riposte
        expect(logs).toHaveLength(1)
        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin"
        })
    })

    it("gère correctement une cible de réaction qui meurt en cours d'exécution", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        // thorns qui inflige beaucoup de dégâts — tue le mage en retour
        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 100 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        // attaque du mage
        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin",
            amount: 10
        })

        // riposte du gobelin qui tue le mage
        expect(logs[1]).toMatchObject({
            type: "damage_dealt",
            sourceId: "gobelin",
            targetId: "mage",
            amount: 100
        })

        // le mage est mort
        expect(logs).toContainEqual(expect.objectContaining({
            type: "entity_died",
            entityId: "mage"
        }))

        // le mage a bien été tué
        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.isDead).toBe(true)
    })

    it("ne déclenche que les passifs de l'entité affectée, pas des entités tierces", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        // gobelin_A est attaqué — mais c'est gobelin_B qui a THORNS
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin_A = buildPlayingEntity({ id: "gobelin_A", teamId: "ENEMY" })
        const gobelin_B = buildPlayingEntity({
            id: "gobelin_B",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin_B" }]
        })

        const fightContext = buildFightContext([mage], [gobelin_A, gobelin_B])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin_A",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        // une seule attaque, pas de riposte — gobelin_A n'a pas THORNS
        const damageLogs = logs.filter(l => l.type === "damage_dealt")
        expect(damageLogs).toHaveLength(1)
        expect(damageLogs[0]).toMatchObject({
            sourceId: "mage",
            targetId: "gobelin_A"
        })
    })

    it("traite les réactions multiples dans l'ordre où elles sont enfilées", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 2 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        // 2 gobelins avec THORNS — mais on n'en attaque qu'un
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin_A = buildPlayingEntity({
            id: "gobelin_A",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin_A" }]
        })
        const gobelin_B = buildPlayingEntity({
            id: "gobelin_B",
            teamId: "ENEMY",
            activePassives: [{ passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin_B" }]
        })

        const fightContext = buildFightContext([mage], [gobelin_A, gobelin_B])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin_A",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")
        
        // attaque du mage + UNE seule riposte (seul gobelin_A est touché)
        expect(damageLogs).toHaveLength(2)
        expect(damageLogs[0]).toMatchObject({ sourceId: "mage",      targetId: "gobelin_A", amount: 10 })
        expect(damageLogs[1]).toMatchObject({ sourceId: "gobelin_A", targetId: "mage",      amount: 2 })
    })

    it("déclenche tous les passifs correspondants sur l'entité affectée", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 3 } }]
        }

        const rageRetaliation: Action = {
            id: "rage_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 5 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const ragePassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "rage_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                if (id === "rage_retaliation")   return rageRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                { passive: thornsPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" },
                { passive: ragePassive,   remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }
            ]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        // 1 attaque + 2 ripostes
        expect(damageLogs).toHaveLength(3)

        // l'attaque du mage
        expect(damageLogs[0]).toMatchObject({ sourceId: "mage", targetId: "gobelin", amount: 10 })

        // les deux ripostes — peu importe l'ordre
        const ripostes = damageLogs.slice(1)
        expect(ripostes).toEqual(expect.arrayContaining([
            expect.objectContaining({ sourceId: "gobelin", targetId: "mage", amount: 3 }),
            expect.objectContaining({ sourceId: "gobelin", targetId: "mage", amount: 5 })
        ]))
    })

    it("ne déclenche que les passifs du bon trigger type", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 3 } }]
        }

        const deathExplosion: Action = {
            id: "death_explosion",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 100 } }]
        }

        const thornsPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DAMAGE_RECEIVED",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const explosionPassive: PassiveConfig = {
            kind: "TRIGGERED",
            triggerType: "ON_DEATH",  // ne doit pas se déclencher sur un coup non létal
            triggeredActionId: "death_explosion",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                if (id === "death_explosion")    return deathExplosion
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                { passive: thornsPassive,    remainingTurns: "PERMANENT", sourceEntityId: "gobelin" },
                { passive: explosionPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }
            ]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        // attaque + thorns seulement (pas d'explosion car le gobelin n'est pas mort)
        expect(damageLogs).toHaveLength(2)
        expect(damageLogs[0]).toMatchObject({ sourceId: "mage",    targetId: "gobelin", amount: 10 })
        expect(damageLogs[1]).toMatchObject({ sourceId: "gobelin", targetId: "mage",    amount: 3 })

        // pas de dégâts d'explosion (100 dégâts)
        expect(damageLogs.some(l => l.amount === 100)).toBe(false)
    })

    it("ignore les passifs modificateurs lors de la résolution des réactions", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [{ type: "damage", order: 1, params: { damage_value: 10 } }]
        }

        const damageReductionPassive: PassiveConfig = {
            kind: "MODIFIER",
            modifier: "damageReceivedModifier",
            value: -20,
            duration: "PERMANENT"
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{
                passive: damageReductionPassive,
                remainingTurns: "PERMANENT",
                sourceEntityId: "gobelin"
            }]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        // une seule attaque, aucune réaction enfilée
        expect(damageLogs).toHaveLength(1)
        expect(damageLogs[0]).toMatchObject({
            sourceId: "mage",
            targetId: "gobelin"
        })
    })
})