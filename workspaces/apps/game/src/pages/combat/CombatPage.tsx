import { useCombatScene } from "../../features/fight/rendering/hooks/use-combat-scene.hook.ts";
import { useCombatReplay } from "../../features/fight/rendering/hooks/use-combat-replay.hook.ts";
import { CELL_SIZE } from "../../features/fight/rendering/CombatScene.ts";
import { HealthBarsOverlay } from "./components/HealthBarsOverlay";
import { CurrentActionBanner } from "./components/CurrentActionBanner";
import { TurnCounter } from "./components/TurnCounter";
import { TurnOrderList } from "./components/TurnOrderList";
import { ActiveEntityCard } from "./components/ActiveEntityCard";
import { CombatLog } from "./components/CombatLog";
import STYLES from "./styles";

export function CombatPage() {
    const { containerRef, sceneRef, store } = useCombatScene();
    const state = useCombatReplay(store);

    const stageWidth = (state.mapDimensions?.width ?? 10) * CELL_SIZE;
    const stageHeight = (state.mapDimensions?.height ?? 10) * CELL_SIZE;

    const activeEntity = state.currentTurnOwnerId ? state.entities[state.currentTurnOwnerId] : undefined;

    return (
        <div className={STYLES.container}>
            {/* Barre du haut : action en cours + pause */}
            <div className={STYLES.topBar}>
                <div className="flex-1" />
                <CurrentActionBanner action={state.currentAction} />
                <div className="flex-1 flex justify-end">
                    <div className={STYLES.pauseZone}>
                        <span>{state.status === "ended" ? "Terminé" : "En pause"}</span>
                    </div>
                </div>
            </div>

            <div className={STYLES.body}>
                {/* Colonne gauche : compteur, ordre des tours, entité active */}
                <div className={STYLES.leftColumn}>
                    <TurnCounter turnIndex={state.turnIndex} />
                    <span className={STYLES.panelTitle}>—— Tours ——</span>
                    <div className={STYLES.turnOrderScroll}>
                        <TurnOrderList owners={state.upcomingTurnOwners} entities={state.entities} />
                    </div>
                    <ActiveEntityCard entity={activeEntity} />
                </div>

                {/* Centre : la grille Pixi + overlay barres de vie */}
                <div className={STYLES.stageColumn}>
                    <div
                        className={STYLES.stageWrapper}
                        style={{ width: stageWidth, height: stageHeight }}
                    >
                        <div ref={containerRef} style={{ width: stageWidth, height: stageHeight }} />
                        <HealthBarsOverlay sceneRef={sceneRef} store={store} />
                    </div>
                </div>

                {/* Colonne droite : journal de combat */}
                <div className={STYLES.rightColumn}>
                    <CombatLog logs={state.logs} />
                </div>
            </div>
        </div>
    );
}
