import { useSyncExternalStore } from "react"
import type { CombatViewStore } from "../../replay/CombatViewStore"
import type { CombatViewState } from "../../replay/combat-view.types"

/** Abonne un composant React à l'état de vue du combat. */
export function useCombatReplay(store: CombatViewStore): CombatViewState {
    return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
