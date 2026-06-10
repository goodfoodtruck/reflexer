import { useCombatScene } from "@features/fight/rendering/hooks/use-combat-scene.hook";
import { CELL_SIZE } from "@features/fight/rendering/CombatScene";
import { HealthBarsOverlay } from "@components/ui/combat/HealthBarsOverlay";
import { TurnCounter } from "@components/ui/combat/TurnCounter";
import { ActiveEntityCard } from "@components/ui/combat/ActiveEntityCard";
import { CombatLog } from "@components/ui/combat/CombatLog";
import { TurnRoster } from "@components/ui/combat/TurnRoster";
import STYLES from "./styles";
import { useLocation } from "react-router-dom";
import type { BasePvpFight } from "@shared/fight.types";
import { useState } from "react";
import CombatTransition from "@features/fight/vs-screen/CombatTransition";

export type CombatPageLocationState = {
    playerName: string
    opponentName: string
    fightResult: BasePvpFight
}

export function CombatPage() {
    const location = useLocation() as { state: CombatPageLocationState }
    const fightResult = location.state.fightResult
    const [phase, setPhase] = useState<"TRANSITION" | "COMBAT">("TRANSITION")
    const { containerRef, sceneRef, state } = useCombatScene(fightResult, phase === "COMBAT");

    const stageWidth = (state.mapDimensions?.width ?? 10) * CELL_SIZE;
    const stageHeight = (state.mapDimensions?.height ?? 10) * CELL_SIZE;

    const activeId = state.currentTurnOwnerId;
    const activeEntity = activeId ? state.entities[activeId] : undefined;
    const nextId = state.upcomingTurnOwners[0] ?? null;

    // Ordre d'affichage figé (ordre d'init des entités) : seuls les badges
    // « Joue » / « Suivant » bougent, pas les cartes.
    const members = Object.values(state.entities);

    return (
        <>
            {phase === "TRANSITION" && (
                <CombatTransition
                    playerName={location.state.playerName}
                    opponentName={location.state.opponentName}
                    onComplete={() => setPhase("COMBAT")}
                />
            )}
            {phase === "COMBAT" && (
                <div className={STYLES.container}>
                    {/* Bandeau haut : compteur de tour · statut */}
                    <div className={STYLES.topBar}>
                        <TurnCounter turnIndex={state.turnIndex} />
                        <div className="flex-1" />
                        <div className={STYLES.pauseZone}>
                            <span>{state.status === "ended" ? "Terminé" : "En pause"}</span>
                        </div>
                    </div>

                    <div className={STYLES.body}>
                        {/* Colonne gauche : narration groupée (actif → feed) */}
                        <div className={STYLES.leftColumn}>
                            <ActiveEntityCard entity={activeEntity} />
                            <div className={STYLES.feedScroll}>
                                <CombatLog logs={state.logs} />
                            </div>
                        </div>

                        {/* Centre : la grille Pixi + overlay barres de vie */}
                        <div className={STYLES.stageColumn}>
                            <div
                                className={STYLES.stageWrapper}
                                style={{ width: stageWidth, height: stageHeight }}
                            >
                                <div ref={containerRef} style={{ width: stageWidth, height: stageHeight }} />
                                <HealthBarsOverlay sceneRef={sceneRef} entities={state.entities} />
                            </div>
                        </div>

                        {/* Colonne droite : liste unique (ordre figé), badges Joue / Suivant */}
                        <div className={STYLES.rightColumn}>
                            <TurnRoster members={members} activeId={activeId} nextId={nextId} />
                        </div>
                    </div>
                </div>
            )}
        </>
        
    );
}
