import { BattleEngine } from '@domain/battle/BattleEngine';
import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { MapData, EntityDefinition } from '@domain/shared/types';
import { MapGenerator } from '@domain/map/MapGenerator';
import { EncounterGenerator } from '@domain/encounter/EncounterGenerator';
import { eventBus } from '@infra/bridge/EventBus';

export const GameEvents = {
  SCREEN_CHANGE: 'screen:change',
  BATTLE_EVENTS: 'battle:events',
  MAP_UPDATED: 'map:updated',
  BATTLE_STATE_UPDATED: 'battle:state-updated',
  PARTY_UPDATED: 'party:updated',
} as const;

export type GameScreen =
  | 'menu'
  | 'map'
  | 'battle'
  | 'party-setup'
  | 'gambit-condition-editor'
  | 'gambit-action-editor'
  | 'target-editor'
  | 'game-over'
  | 'victory';

export interface GameSnapshot {
  readonly screen: GameScreen;
  readonly mapData: MapData | null;
  readonly battleEngine: BattleEngine | null;
  readonly battleState: BattleState | null;
  readonly playerParty: readonly EntityDefinition[];
  readonly battleLog: readonly BattleEvent[];
  readonly isAutoPlaying: boolean;
  readonly editingHeroIndex: number | null;
  readonly editingRuleId: string | null;
  readonly version: number;
}

type Subscriber = () => void;

class GameStore {
  private _screen: GameScreen = 'menu';
  private _mapData: MapData | null = null;
  private _battleEngine: BattleEngine | null = null;
  private _battleState: BattleState | null = null;
  private _playerParty: EntityDefinition[] = [];
  private _battleLog: BattleEvent[] = [];
  private _isAutoPlaying = false;
  private _editingHeroIndex: number | null = null;
  private _editingRuleId: string | null = null;
  private _version = 0;

  private _snapshot: GameSnapshot = this.buildSnapshot();
  private subscribers = new Set<Subscriber>();
  private partyListeners = new Set<Subscriber>();

  // ─── Subscribe ─────────────────────────────────────────────
  subscribe = (callback: Subscriber): (() => void) => {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  };

  getSnapshot = (): GameSnapshot => this._snapshot;

  private buildSnapshot(): GameSnapshot {
    return Object.freeze({
      screen: this._screen,
      mapData: this._mapData,
      battleEngine: this._battleEngine,
      battleState: this._battleState,
      playerParty: this._playerParty,
      battleLog: this._battleLog,
      isAutoPlaying: this._isAutoPlaying,
      editingHeroIndex: this._editingHeroIndex,
      editingRuleId: this._editingRuleId,
      version: this._version,
    });
  }

  private notify(): void {
    this._version++;
    this._snapshot = this.buildSnapshot();
    for (const sub of this.subscribers) sub();
  }

  // ─── Party update bus ──────────────────────────────────────
  onPartyUpdate(cb: Subscriber): () => void {
    this.partyListeners.add(cb);
    return () => this.partyListeners.delete(cb);
  }

  notifyPartyUpdate(): void {
    for (const cb of this.partyListeners) cb();
  }

  // ─── Accesseurs ────────────────────────────────────────────
  get screen(): GameScreen { return this._screen; }
  get mapData(): MapData | null { return this._mapData; }
  get battleEngine(): BattleEngine | null { return this._battleEngine; }
  get battleState(): BattleState | null { return this._battleState; }
  get battleLog(): readonly BattleEvent[] { return this._battleLog; }
  get playerParty(): EntityDefinition[] { return this._playerParty; }

  // ─── Party management ──────────────────────────────────────

  setPlayerParty(party: EntityDefinition[]): void {
    this._playerParty = party;
    this.notify();
  }

  // ─── Editing state (condition + target editors) ────────────

  startEditingRule(heroIdx: number, ruleId: string | null): void {
    this._editingHeroIndex = heroIdx;
    this._editingRuleId = ruleId;
    this._screen = 'gambit-condition-editor';
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }

  startEditingAction(heroIdx: number, ruleId: string) {
    this._editingHeroIndex = heroIdx;
    this._editingRuleId = ruleId;
    this._screen = 'gambit-action-editor';
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }

  startEditingTarget(heroIdx: number, ruleId: string): void {
    this._editingHeroIndex = heroIdx;
    this._editingRuleId = ruleId;
    this._screen = 'target-editor';
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }

  clearEditing(): void {
    this._editingHeroIndex = null;
    this._editingRuleId = null;
    this.notify();
  }

  // ─── Game flow ─────────────────────────────────────────────

  startNewGame(playerParty?: EntityDefinition[]): void {
    if (playerParty) this._playerParty = playerParty;
    const mapGen = new MapGenerator();
    this._mapData = mapGen.generate();
    this._screen = 'map';
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
    eventBus.emit(GameEvents.MAP_UPDATED, this._mapData);
  }

  selectMapNode(nodeId: string): void {
    if (!this._mapData) return;
    const node = this._mapData.nodes.get(nodeId);
    if (!node) return;
    this._mapData.currentNodeId = nodeId;

    if (node.type === 'COMBAT' || node.type === 'ELITE' || node.type === 'BOSS') {
      const encounterGen = new EncounterGenerator();
      const encounter = node.encounter ?? encounterGen.generateEncounter(node.type);
      node.encounter = encounter;
      const entities = encounterGen.spawnEntities(this._playerParty, encounter);
      this._battleEngine = new BattleEngine(entities, encounter.gridConfig);
      this._battleState = this._battleEngine.getState();
      this._battleLog = [];
      this._battleEngine.onEvents((events) => {
        this._battleLog = [...this._battleLog, ...events];
        this._battleState = this._battleEngine!.getState();
        this.notify();
        eventBus.emit(GameEvents.BATTLE_EVENTS, events);
      });
      this._screen = 'battle';
    } else {
      node.completed = true;
    }
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }

  startBattle(): void {
    if (!this._battleEngine) return;
    this._battleEngine.start();
    this._battleState = this._battleEngine.getState();
    this.notify();
  }

  tickBattle(): void {
    if (!this._battleEngine) return;
    this._battleEngine.tick();
    this._battleState = this._battleEngine.getState();
    this.notify();
    this.checkBattleEnd();
  }

  async autoPlayBattle(delayMs = 400): Promise<void> {
    if (!this._battleEngine || this._isAutoPlaying) return;
    this._isAutoPlaying = true;
    this.notify();
    this.startBattle();
    while (!this._battleEngine.isOver() && this._isAutoPlaying) {
      this.tickBattle();
      await new Promise((r) => setTimeout(r, delayMs));
    }
    this._isAutoPlaying = false;
    this.notify();
    this.checkBattleEnd();
  }

  stopAutoPlay(): void {
    this._isAutoPlaying = false;
    this.notify();
  }

  private checkBattleEnd(): void {
    if (!this._battleEngine) return;
    const result = this._battleEngine.isOver();
    if (!result) return;
    if (result.winner === 'PLAYER') {
      if (this._mapData?.currentNodeId) {
        const node = this._mapData.nodes.get(this._mapData.currentNodeId);
        if (node) node.completed = true;
        this._screen = this._mapData.currentNodeId === this._mapData.bossNodeId ? 'victory' : 'map';
      }
    } else {
      this._screen = 'game-over';
    }
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }

  goToScreen(screen: GameScreen): void {
    this._screen = screen;
    this.notify();
    eventBus.emit(GameEvents.SCREEN_CHANGE, this._screen);
  }
}

export const gameStore = new GameStore();
