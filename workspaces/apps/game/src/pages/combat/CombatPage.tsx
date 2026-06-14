import { useCombatScene } from "@features/fight/rendering/hooks/use-combat-scene.hook";
import { CELL_SIZE } from "@features/fight/rendering/CombatScene";
import { HealthBarsOverlay } from "@components/ui/combat/HealthBarsOverlay";
import { TurnCounter } from "@components/ui/combat/TurnCounter";
import { CombatLog } from "@components/ui/combat/CombatLog";
import { TurnRoster } from "@components/ui/combat/TurnRoster";
import { AnimatedBackground } from "@components/ui/AnimatedBackground";
import bgHomeImage from "../../assets/images/bg-home.png";
import type { CombatLogLine } from "../../features/fight/replay/combat-view.types";
import STYLES from "./styles";
import { useLocation } from "react-router-dom";
import type { BasePvpFight } from "../../shared/types/fight.types";
import { useState } from "react";
import CombatTransition from "@features/fight/vs-screen/CombatTransition";
import {GambitInspector} from "../../components/ui/combat/GambitInspector.tsx";

export type CombatPageLocationState = {
    playerName: string
    opponentName: string
    fight: BasePvpFight
}

export function CombatPage() {
    const [selectedLog, setSelectedLog] = useState<CombatLogLine | null>(null);
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
                    <style>{`
                        @keyframes ambient-zoom {
                            0% { transform: scale(1.05) translate(0, 0); }
                            100% { transform: scale(1.15) translate(-1%, -1%); }
                        }
                    `}</style>

                    <div className={STYLES.bgContainer}>
                        <img src={bgHomeImage} alt="Champ de bataille" className={STYLES.bgImage} />
                    </div>
                    <AnimatedBackground />

                    <div className={STYLES.overlay} />
                    <div className={STYLES.scanlines} />

                    <div className={STYLES.foreground}>
                        {/* Bandeau haut : compteur de tour · statut */}
                        <div className={STYLES.topBar}>
                            <TurnCounter turnIndex={state.turnIndex} status={state.status} />
                        </div>

                        <div className={STYLES.body}>
                            {/* Scène : la grille Pixi + overlay barres de vie */}
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
                                    <CombatLog
                                        logs={state.logs}
                                        selectedId={selectedLog?.id ?? null}
                                        onSelect={line => setSelectedLog(prev => (prev?.id === line.id ? null : line))}
                                    />
                                </div>
                            </div>

                            {/* Fenêtre de détail : apparaît à droite des logs au clic sur une ligne */}
                            {selectedLog && (
                                <div className={STYLES.inspectorColumn}>
                                    <GambitInspector line={selectedLog} onClose={() => setSelectedLog(null)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
