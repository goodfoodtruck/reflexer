/**
 * EventBus partagé — découple le Domain de l'infra (Phaser + React).
 *
 * Le BattleEngine émet des BattleEvents via le bus.
 * Les scènes Phaser écoutent pour animer.
 * Les composants React écoutent pour mettre à jour l'UI.
 */

type Listener<T = any> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Retourne une fonction unsubscribe
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit<T>(event: string, payload: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      listener(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Singleton global
export const eventBus = new EventBus();
