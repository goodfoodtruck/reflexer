import React from 'react';
import { gameStore } from '@infra/bridge/GameStore';

export function GameOverScreen(): React.ReactElement {
  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.title, color: '#ef4444' }}>💀 DÉFAITE</h1>
      <p style={styles.subtitle}>Tes héros sont tombés au combat.</p>
      <button style={styles.btn} onClick={() => gameStore.goToScreen('menu')}>
        Retour au menu
      </button>
    </div>
  );
}

export function VictoryScreen(): React.ReactElement {
  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.title, color: '#22c55e' }}>🎉 VICTOIRE !</h1>
      <p style={styles.subtitle}>Tu as vaincu le boss et conquis la carte.</p>
      <button style={styles.btn} onClick={() => gameStore.goToScreen('menu')}>
        Retour au menu
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontFamily: '"JetBrains Mono", monospace',
    color: '#e2e8f0',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    marginBottom: '2rem',
  },
  btn: {
    padding: '12px 32px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
