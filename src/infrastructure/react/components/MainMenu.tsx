import React, { useEffect } from 'react';
import { gameStore } from '@infra/bridge/GameStore';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import { DEFAULT_PARTY } from '@domain/shared/defaultParty';
import backgroundGif from '@assets/background.gif'; // 👈 adapte le nom de ton fichier

export function MainMenu(): React.ReactElement {
  const store = useGameStore();

  useEffect(() => {
    if (store.playerParty.length === 0) {
      gameStore.setPlayerParty(DEFAULT_PARTY.map((d) => ({ ...d, automations: [...d.automations] })));
    }
  }, []);

  const handleStart = () => {
    gameStore.goToScreen('party-setup');
  };

  return (
      <div style={styles.container}>
        <img src={backgroundGif} style={styles.background} alt="" />
        <h1 style={styles.title}>⚔ AUTO-BATTLER ROGUELIKE ⚔</h1>
        <div style={styles.leftPanel}>
          <button style={styles.btn} onClick={handleStart}>
            Lancer la partie
          </button>
        </div>
      </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    fontFamily: '"JetBrains Mono", monospace',
    color: '#e2e8f0',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  title: {
    position: 'relative',
    zIndex: 1,
    fontSize: '2.5rem',
    marginTop: '6rem',
    marginBottom: 0,
    letterSpacing: '0.1em',
    textAlign: 'center',
  },
  leftPanel: {
    position: 'absolute',
    zIndex: 1,
    left: '2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
  },
  btn: {
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
  }
};