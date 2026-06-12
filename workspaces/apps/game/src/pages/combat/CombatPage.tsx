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
    fight: BasePvpFight
}

export function CombatPage() {
    const location = useLocation() as { state: CombatPageLocationState }
    const fight = location.state.fight
    const [phase, setPhase] = useState<"TRANSITION" | "COMBAT">("TRANSITION")
    const { containerRef, sceneRef, state } = useCombatScene(fight, phase === "COMBAT");

    const stageWidth = (state.mapDimensions?.width ?? 10) * CELL_SIZE;
    const stageHeight = (state.mapDimensions?.height ?? 10) * CELL_SIZE;

    const activeId = state.currentTurnOwnerId;
    const nextId = state.upcomingTurnOwners[0] ?? null;

    // Ordre d'affichage = ordre de passage figé (1er en haut, 2e en dessous…).
    // Les cartes ne bougent pas d'un tour à l'autre : seuls les badges
    // « Joue » / « Suivant » descendent le long de la liste (et reviennent en
    // haut après le dernier). `state.turnOrder` est calculé une seule fois.
    const ordered = state.turnOrder.map(id => state.entities[id]).filter(Boolean);
    const rest = Object.values(state.entities).filter(entity => !state.turnOrder.includes(entity.id));
    const members = [...ordered, ...rest];

    return (
        <>
            {phase === "TRANSITION" && (
                <CombatTransition
                    playerName={location.state.playerName}
                    opponentName={location.state.opponentName}
                    onComplete={() => setPhase("COMBAT")}
                />
            )}
            {phase == "COMBAT" && (
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
                        {/* Scène : la grille Pixi + overlay barres de vie, calée à gauche */}
                        <div className={STYLES.stageColumn}>
                            <div
                                className={STYLES.stageWrapper}
                                style={{ width: stageWidth, height: stageHeight }}
                            >
                                <div ref={containerRef} style={{ width: stageWidth, height: stageHeight }} />
                                <HealthBarsOverlay sceneRef={sceneRef} entities={state.entities} />
                            </div>
                        </div>

                        {/* Colonne droite : roster (ordre de passage) puis journal dessous */}
                        <div className={STYLES.rightColumn}>
                            <div className={STYLES.rosterPane}>
                                <TurnRoster members={members} activeId={activeId} nextId={nextId} />
                            </div>
                            <div className={STYLES.feedScroll}>
                                <CombatLog logs={state.logs} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
