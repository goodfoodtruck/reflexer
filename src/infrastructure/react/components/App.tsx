import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import { createPhaserGame, switchPhaserScene } from '@infra/phaser/PhaserGame';
import { eventBus } from '@infra/bridge/EventBus';
import { MainMenu } from './MainMenu';
import { BattleHUD } from './BattleHUD';
import { PartySetup } from './PartySetup';
import { GambitConditionEditor } from './GambitConditionEditor';
import { GambitTargetEditor } from './GambitTargetEditor';
import { GameOverScreen, VictoryScreen } from './EndScreens';
import { GambitActionEditor } from './GambitActionEditor';

export function App(): React.ReactElement {
  const store = useGameStore();
  const phaserContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (phaserContainerRef.current && !phaserGameRef.current) {
      phaserGameRef.current = createPhaserGame(phaserContainerRef.current);
    }
    return () => {
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
      eventBus.clear();
    };
  }, []);

  useEffect(() => {
    if (phaserGameRef.current) {
      switchPhaserScene(phaserGameRef.current, store.screen);
    }
  }, [store.screen]);

  const showPhaser = store.screen === 'map' || store.screen === 'battle';

  return (
    <div style={styles.root}>
      <div
        ref={phaserContainerRef}
        style={{
          ...styles.phaserContainer,
          display: showPhaser ? 'block' : 'none',
        }}
      />

      {store.screen === 'menu' && <MainMenu />}
      {store.screen === 'party-setup' && <PartySetup />}
      {store.screen === 'gambit-condition-editor' && <GambitConditionEditor />}
      {store.screen === 'gambit-action-editor' && <GambitActionEditor />}
      {store.screen === 'target-editor' && <GambitTargetEditor />}
      {store.screen === 'battle' && <BattleHUD />}
      {store.screen === 'game-over' && <GameOverScreen />}
      {store.screen === 'victory' && <VictoryScreen />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    background: '#0a0a0f',
  },
  phaserContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};
