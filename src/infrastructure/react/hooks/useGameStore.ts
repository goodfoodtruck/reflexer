import { useSyncExternalStore } from 'react';
import { gameStore } from '@infra/bridge/GameStore';

/**
 * Hook React qui s'abonne au GameStore.
 * Re-render automatique quand le store change.
 */
export function useGameStore() {
  return useSyncExternalStore(
    (callback) => gameStore.subscribe(callback),
    () => gameStore.getSnapshot(),
  );
}
