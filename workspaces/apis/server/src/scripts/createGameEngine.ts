

// Garde-fous de fin de combat : on coupe au bout de MAX_TURNS tours d'entité,

import { GameEngine, InMemoryFightMapRegistry, InMemoryActionRegistry, InMemoryEnemyRegistry, FilterApplier, buildFilterRegistry, EntityScopeResolver, GambitTargetResolver, ActionGambitResolver, EntityMovementResolver, ProcessorFactory, ProcessorChain, ActionChainExecutor, EntityMovementExecutor, EntityPassiveExecutor, TurnController, FightLogger, FightStateResolver, FightOrchestrator, FightContextFactory, FightEntitiesValidator, NbEnemiesResolver, EnemyBuilder, EnemyCompositionResolver, FightCommandHandler, GameEngineDeps, InMemoryPassiveRegistry, ConditionResolver, FightSafetyChecker, TriggeredPassiveResolver, TeamBuilder, FightMapConfig, EFightMapSize } from "@reflexer/engine"

// ou si un motif de <= MAX_CYCLE_LENGTH tours se répète CYCLE_REPETITIONS fois.
const MAX_TURNS = 100
const MAX_CYCLE_LENGTH = 6
const CYCLE_REPETITIONS = 4

/**
 * Composition root du moteur : assemble le `GameEngine` complet câblé sur les
 * registres in-memory et les données mockées. C'est l'unique endroit qui
 * connaît l'ordre de montage de toute la chaîne de combat ; le reste du code
 * (front, tests d'intégration, scripts) ne dépend que de `GameEngine`.
 *
 * Les handlers map/shop/chest sont des stubs : seul le combat est branché pour
 * l'instant.
 */
export function createGameEngine(): GameEngine {
    const config: FightMapConfig = {
        id: "MAP_1",
        dimensions: {
            width: 0,
            height: 0
        },
        size: EFightMapSize.SMALL_RANGE,
        cells: [],
        spawnPoints: {
            player: [],
            enemy: []
        }
    }
    // Registres (sources de données mockées)
    const fightMapRegistry = new InMemoryFightMapRegistry([config])
    const actionRegistry = new InMemoryActionRegistry([])
    const passiveRegistry = new InMemoryPassiveRegistry()
    const enemyRegistry = new InMemoryEnemyRegistry([])

    // Résolution des gambits (ciblage)
    const filterApplier = new FilterApplier(buildFilterRegistry())
    const entityScopeResolver = new EntityScopeResolver()
    const targetResolver = new GambitTargetResolver(filterApplier, entityScopeResolver)
    const conditionResolver = new ConditionResolver(filterApplier, entityScopeResolver)
    const actionGambitResolver = new ActionGambitResolver(conditionResolver, targetResolver)
    const movementResolver = new EntityMovementResolver(targetResolver, conditionResolver)

    // Exécution des actions (processeurs)
    const processorFactory = new ProcessorFactory(passiveRegistry)
    const processorChain = new ProcessorChain()
    const triggeredPassiveResolver = new TriggeredPassiveResolver(targetResolver)
    const actionChainExecutor = new ActionChainExecutor(processorFactory, actionRegistry, triggeredPassiveResolver, processorChain)
    const movementExecutor = new EntityMovementExecutor(actionChainExecutor)
    const passiveExecutor = new EntityPassiveExecutor(triggeredPassiveResolver, actionChainExecutor)

    // Boucle de combat
    const turnController = new TurnController(passiveExecutor, movementResolver, movementExecutor, actionGambitResolver, actionChainExecutor)
    const fightLogger = new FightLogger()
    const fightStateResolver = new FightStateResolver(new FightSafetyChecker(MAX_TURNS, MAX_CYCLE_LENGTH, CYCLE_REPETITIONS))
    const orchestrator = new FightOrchestrator(turnController, fightLogger, fightStateResolver)

    // Fabrique du contexte de combat (construction des entités)
    const fightContextFactory = new FightContextFactory({
        validator: new FightEntitiesValidator(),
        nbEnemiesResolver: new NbEnemiesResolver(),
        enemyBuilder: new EnemyBuilder(enemyRegistry),
        enemyCompositionResolver: new EnemyCompositionResolver(),
        teamBuilder: new TeamBuilder(),
    })

    const fightHandler = new FightCommandHandler(orchestrator, fightContextFactory, fightMapRegistry)

    const deps: GameEngineDeps = {
        mapGenerator: { generate: () => ({}) },
        mapCommandHandler: {
            selectMapNode: () => ({ success: true, value: { nodeType: "COMBAT", fightMapId: "TRAINING_GROUND" } }),
        },
        fightHandler,
        shopHandler: { buyItem: () => { throw new Error("Shop non implémenté") } },
        chestHandler: { selectReward: () => { throw new Error("Chest non implémenté") } },
    }

    return new GameEngine(deps)
}
