import Phaser from 'phaser';
import { BattleScene } from '@infra/phaser/scenes/BattleScene';
import { MapScene } from '@infra/phaser/scenes/MapScene';

let _isBooted = false;
let _pendingScreen: string | null = null;

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  _isBooted = false;
  _pendingScreen = null;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 640,
    backgroundColor: '#0a0a0f',
    // Pas de scène dans le tableau → rien ne démarre automatiquement
    scene: [],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };

  const game = new Phaser.Game(config);

  // Enregistrer les scènes manuellement sans les démarrer
  game.events.once('ready', () => {
    game.scene.add('MapScene', MapScene, false);
    game.scene.add('BattleScene', BattleScene, false);
    _isBooted = true;

    // Si un switch était demandé avant que le game soit prêt, l'exécuter maintenant
    if (_pendingScreen !== null) {
      switchPhaserScene(game, _pendingScreen);
      _pendingScreen = null;
    }
  });

  return game;
}

/**
 * Stop une scène seulement si elle est active ou en pause.
 */
function safeStop(game: Phaser.Game, key: string): void {
  const scene = game.scene.getScene(key);
  if (!scene) return;
  // isActive() ou isSleeping() = la scène tourne → on peut stop
  if (game.scene.isActive(key) || game.scene.isSleeping(key)) {
    game.scene.stop(key);
  }
}

/**
 * Switch la scène active selon le GameScreen.
 * Si le game n'est pas encore boot, on met en attente.
 */
export function switchPhaserScene(
  game: Phaser.Game,
  screen: string,
): void {
  if (!_isBooted) {
    _pendingScreen = screen;
    return;
  }

  switch (screen) {
    case 'map':
      safeStop(game, 'BattleScene');
      game.scene.start('MapScene');
      break;
    case 'battle':
      safeStop(game, 'MapScene');
      game.scene.start('BattleScene');
      break;
    default:
      // Menu, game-over, victory → pas de scène Phaser active
      safeStop(game, 'MapScene');
      safeStop(game, 'BattleScene');
      break;
  }
}
