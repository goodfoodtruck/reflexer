# Auto-Battler Roguelike — Architecture Prototype

## Lancer le projet

```bash
npm install
npm run dev
```

## Stack technique

| Couche | Techno | Rôle |
|--------|--------|------|
| Domain | TypeScript pur | Logique métier, zéro dépendance framework |
| Rendu jeu | Phaser 3 | Canvas 2D : grille, sprites, animations |
| UI overlay | React 18 | HUD, menus, éditeur d'automatismes |
| Bridge | EventBus + GameStore | Découple domain ↔ Phaser ↔ React |
| Build | Vite 5 | HMR, bundling, path aliases |

---

## Architecture DDD — Vue d'ensemble

```
src/
├── domain/                    ← PURE LOGIQUE MÉTIER (0 dépendance framework)
│   ├── shared/
│   │   └── types.ts           ← Types partagés (Entity, Spell, Automation, Map…)
│   │
│   ├── battle/                ← Bounded Context : Combat
│   │   ├── BattleEngine.ts    ← Point d'entrée, orchestre tout
│   │   ├── BattleState.ts     ← Snapshot immuable de l'état
│   │   │
│   │   ├── commands/          ← Command Pattern (actions sérialisables)
│   │   │   ├── Command.ts
│   │   │   ├── MoveCommand.ts
│   │   │   ├── CastSpellCommand.ts
│   │   │   ├── AutomationCommand.ts
│   │   │   └── PassTurnCommand.ts
│   │   │
│   │   ├── events/            ← Event Sourcing (résultats immuables)
│   │   │   └── BattleEvent.ts ← Union type de tous les events
│   │   │
│   │   ├── state-machine/     ← FSM du déroulement du combat
│   │   │   └── BattleFSM.ts   ← Start → TurnStart → Execution → TurnEnd → VictoryCheck
│   │   │
│   │   ├── components/        ← ECS léger (données des entités)
│   │   │   └── index.ts       ← Health, Position, Stats, Spells, Automations, StatusEffects
│   │   │
│   │   ├── systems/           ← ECS léger (logique pure sur les components)
│   │   │   ├── GridSystem.ts          ← Pathfinding A*, LOS, zones
│   │   │   ├── CombatSystem.ts        ← Résolution dégâts, formules
│   │   │   ├── TurnOrderSystem.ts     ← Ordre de jeu selon SPD
│   │   │   ├── StatusSystem.ts        ← Tick des effets, expiration
│   │   │   └── AutomationSystem.ts    ← Évalue conditions → génère Commands
│   │   │
│   │   └── automation/        ← Moteur d'automatismes
│   │       ├── ConditionEvaluator.ts  ← Évalue { type, params } vs BattleState
│   │       ├── ActionResolver.ts      ← Traduit action → Command concrète
│   │       └── TargetSelector.ts      ← Résout la cible selon les règles
│   │
│   ├── map/                   ← Bounded Context : Carte
│   │   └── MapGenerator.ts    ← Génération procédurale graphe Slay-the-Spire
│   │
│   └── encounter/             ← Bounded Context : Rencontres
│       └── EncounterGenerator.ts ← Spawn ennemis, grille, templates
│
└── infrastructure/            ← ADAPTERS (Phaser, React, bridge)
    ├── bridge/
    │   ├── EventBus.ts        ← Pub/sub découplé domain ↔ infra
    │   └── GameStore.ts       ← État global, orchestre les moteurs
    │
    ├── phaser/
    │   ├── PhaserGame.ts      ← Config Phaser + switch de scènes
    │   └── scenes/
    │       ├── BattleScene.ts ← Rendu grille + entités + animations
    │       └── MapScene.ts    ← Rendu graphe de la carte
    │
    └── react/
        ├── hooks/
        │   └── useGameStore.ts
        └── components/
            ├── App.tsx              ← Routeur par screen + mount Phaser
            ├── MainMenu.tsx         ← Écran d'accueil
            ├── BattleHUD.tsx        ← Overlay combat (log, contrôles, entités)
            ├── AutomationEditor.tsx ← Éditeur d'automatismes
            └── EndScreens.tsx       ← Game Over + Victory
```

---

## Les 4 moteurs — correspondance fichiers

### 1. Moteur de carte (MapGenerator)

**Fichier** : `domain/map/MapGenerator.ts`

Génère un graphe de noeuds en rangées, style Slay the Spire :
- Profondeur configurable (12 niveaux par défaut)
- Types de noeuds : Combat, Elite, Boss, Rest, Event, Shop
- Connexions avec densité contrôlable (chaque noeud a ≥1 parent et ≥1 enfant)
- Boss en fin de graphe

### 2. Moteur de rencontres (EncounterGenerator)

**Fichier** : `domain/encounter/EncounterGenerator.ts`

Initialise chaque combat :
- Grille de taille variable selon le type de noeud
- Obstacles aléatoires
- Spawn des ennemis côté droit (templates : Goblin, Skeleton Archer, Orc Brute)
- Spawn des joueurs côté gauche
- Création des `BattleEntity` avec tous leurs components

### 3. Moteur de combat (BattleEngine + BattleFSM)

**Fichiers** : `domain/battle/BattleEngine.ts`, `domain/battle/state-machine/BattleFSM.ts`

Gère le tour par tour :
```
NotStarted → TurnStart → Execution → TurnEnd → VictoryCheck
                                                    ↓
                                          (tour suivant ou BattleEnded)
```

Chaque tick :
1. **TurnStart** — tick statuts (poison, regen), résout l'automatisme
2. **Execution** — exécute la Command générée (produit des BattleEvents)
3. **TurnEnd** — tick cooldowns
4. **VictoryCheck** — une équipe est-elle éliminée ?

### 4. Moteur d'automatismes (Automation)

**Fichiers** : `domain/battle/automation/`

Un automatisme = Condition + Action + Cible :
1. `ConditionEvaluator` — évalue si la condition est remplie (PV, portée, statut…)
2. `TargetSelector` — résout la cible (ennemi le plus proche, allié le plus faible…)
3. `ActionResolver` — traduit en Command concrète (CastSpell, Move, Flee…)

Les règles sont évaluées par priorité. La première qui match est exécutée.

---

## Patterns utilisés

| Pattern | Où | Pourquoi |
|---------|-----|----------|
| **Command** | `commands/` | Actions sérialisables, replay, undo possible |
| **Event Sourcing** | `events/` | État reconstruit depuis les events, log complet |
| **State Machine** | `state-machine/` | Phases de combat explicites et prévisibles |
| **ECS léger** | `components/` + `systems/` | Séparation données / logique, extensible |
| **Observer** | `EventBus` | Découplage domain ↔ rendu |
| **Adapter** | `infrastructure/` | Phaser et React sont des détails d'implémentation |

---

## Flux de données

```
                    ┌─────────────────┐
                    │   GameStore     │  (orchestre)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        MapGenerator   EncounterGen   BattleEngine
              │              │              │
              │              │      ┌───────┴───────┐
              │              │      ▼               ▼
              │              │   BattleFSM     AutomationSystem
              │              │      │               │
              │              │      ▼               ▼
              │              │   Commands ──→ BattleEvents
              │              │                      │
              └──────────────┼──────────────────────┘
                             │
                         EventBus
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              Phaser Scenes      React Components
              (animations)       (HUD, menus)
```

---

## Étendre le projet

**Ajouter un type d'ennemi** : ajouter un template dans `ENEMY_TEMPLATES` de `EncounterGenerator.ts`.

**Ajouter une condition d'automatisme** : ajouter un case dans `ConditionEvaluator.evaluate()` + un `ConditionType` dans `types.ts`.

**Ajouter un type de sort** : ajouter un `SpellTargetType` + gérer dans `GridSystem.resolveSpellTargets()`.

**Ajouter un effet de statut** : ajouter un `StatusEffectType` + gérer dans `StatusSystem.tickEffects()` + `CombatSystem` si ça affecte les stats.

**Ajouter un type de noeud de carte** : ajouter un `NodeType` + gérer dans `MapGenerator.resolveNodeType()` + `GameStore.selectMapNode()`.
