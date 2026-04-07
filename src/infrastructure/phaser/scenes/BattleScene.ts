import Phaser from 'phaser';
import { eventBus } from '@infra/bridge/EventBus';
import { gameStore, GameEvents } from '@infra/bridge/GameStore';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { BattleEntity } from '@domain/battle/components';
import { Team } from '@domain/shared/types';

// ─── Isometric constants ───────────────────────────────────────
const TILE_W = 72;                    // largeur du losange
const TILE_H = 36;                    // hauteur du losange (ratio 2:1)
const BLOCK_HEIGHT = 18;              // hauteur des blocs obstacles
const ENTITY_LIFT = 4;                // l'entité "flotte" au-dessus de la tile
const ENTITY_RADIUS_X = 16;           // rayon horizontal de l'ellipse
const ENTITY_RADIUS_Y = 10;           // rayon vertical (écrasé en iso)
const ENTITY_HEIGHT = 28;             // hauteur du "corps" de l'entité (capsule)

// ─── Couleurs ──────────────────────────────────────────────────
const COL_TILE_FILL = 0x0f172a;
const COL_TILE_FILL_ALT = 0x131b2e;  // damier léger
const COL_TILE_STROKE = 0x334155;
const COL_OBSTACLE_TOP = 0x1e293b;
const COL_OBSTACLE_LEFT = 0x151d2c;
const COL_OBSTACLE_RIGHT = 0x0e1420;
const COL_OBSTACLE_STROKE = 0x475569;
const COL_PLAYER = 0x3b82f6;
const COL_PLAYER_DARK = 0x2563eb;
const COL_ENEMY = 0xef4444;
const COL_ENEMY_DARK = 0xdc2626;

// ─── Conversion grille → écran iso ─────────────────────────────

function toIso(gx: number, gy: number): { x: number; y: number } {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2),
  };
}

/** Centre d'une tuile en coordonnées iso */
function tileCenterIso(gx: number, gy: number): { x: number; y: number } {
  const tl = toIso(gx, gy);
  const br = toIso(gx + 1, gy + 1);
  return { x: (tl.x + br.x) / 2, y: (tl.y + br.y) / 2 };
}

/** 4 coins du losange d'une tuile */
function tileDiamond(gx: number, gy: number): number[] {
  const top = toIso(gx, gy);            // pointe haute
  const right = toIso(gx + 1, gy);      // pointe droite
  const bottom = toIso(gx + 1, gy + 1); // pointe basse
  const left = toIso(gx, gy + 1);       // pointe gauche
  return [top.x, top.y, right.x, right.y, bottom.x, bottom.y, left.x, left.y];
}

// ════════════════════════════════════════════════════════════════

export class BattleScene extends Phaser.Scene {
  private entitySprites = new Map<string, Phaser.GameObjects.Container>();
  private unsubscribers: (() => void)[] = [];
  private originX = 0;
  private originY = 0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.entitySprites.clear();

    // Calculer l'offset pour centrer la grille iso dans le canvas
    this.computeOrigin();

    this.drawGrid();
    this.spawnEntitySprites();
    this.sortDepth();

    this.unsubscribers.push(
      eventBus.on<BattleEvent[]>(GameEvents.BATTLE_EVENTS, (events) => {
        if (!this.scene.isActive()) return;
        this.handleBattleEvents(events);
      }),
    );
  }

  shutdown(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.entitySprites.clear();
  }

  // ─── Calcul de l'origine (centrage) ────────────────────────

  private computeOrigin(): void {
    const state = gameStore.battleState;
    if (!state) return;
    const { width, height } = state.grid;

    // Bornes de la grille iso
    const topLeft = toIso(0, 0);
    const topRight = toIso(width, 0);
    const bottomLeft = toIso(0, height);
    const bottomRight = toIso(width, height);

    const minX = Math.min(topLeft.x, bottomLeft.x);
    const maxX = Math.max(topRight.x, bottomRight.x);
    const minY = Math.min(topLeft.y, topRight.y);
    const maxY = Math.max(bottomLeft.y, bottomRight.y) + BLOCK_HEIGHT;

    const gridPixelW = maxX - minX;
    const gridPixelH = maxY - minY;

    const canvasW = Number(this.game.config.width);
    const canvasH = Number(this.game.config.height);

    // Centrer, avec un léger décalage vers le haut pour laisser de la place au HUD à droite
    this.originX = (canvasW - 280) / 2 - minX - gridPixelW / 2 + 100;
    this.originY = canvasH / 2 - minY - gridPixelH / 2 + 20;
  }

  // ─── Helpers écran ─────────────────────────────────────────

  /** Convertit une position grille en position écran */
  private toScreen(gx: number, gy: number): { x: number; y: number } {
    const iso = toIso(gx, gy);
    return { x: iso.x + this.originX, y: iso.y + this.originY };
  }

  /** Centre d'une tuile en coords écran */
  private tileCenterScreen(gx: number, gy: number): { x: number; y: number } {
    const c = tileCenterIso(gx, gy);
    return { x: c.x + this.originX, y: c.y + this.originY };
  }

  /** Position d'une entité (centre tuile, décalé vers le haut) */
  private entityScreen(gx: number, gy: number): { x: number; y: number } {
    const c = this.tileCenterScreen(gx, gy);
    return { x: c.x, y: c.y - ENTITY_LIFT - ENTITY_HEIGHT / 2 };
  }

  /** Profondeur d'une position grille (pour le tri) */
  private depthAt(gx: number, gy: number): number {
    return (gx + gy) * 10;
  }

  // ─── Dessin de la grille ───────────────────────────────────

  private drawGrid(): void {
    const state = gameStore.battleState;
    if (!state) return;

    const { width, height, obstacles } = state.grid;
    const g = this.add.graphics();
    g.setDepth(-1000);

    // Dessiner les tuiles de fond en arrière-plan d'abord (arrière → avant)
    for (let gy = 0; gy < height; gy++) {
      for (let gx = 0; gx < width; gx++) {
        const isObstacle = obstacles.some((o) => o.x === gx && o.y === gy);
        if (isObstacle) continue; // les obstacles sont dessinés après

        this.drawTile(g, gx, gy);
      }
    }

    // Dessiner les obstacles comme des blocs 3D (arrière → avant)
    for (let gy = 0; gy < height; gy++) {
      for (let gx = 0; gx < width; gx++) {
        const isObstacle = obstacles.some((o) => o.x === gx && o.y === gy);
        if (!isObstacle) continue;

        this.drawObstacleBlock(gx, gy);
      }
    }
  }

  private drawTile(g: Phaser.GameObjects.Graphics, gx: number, gy: number): void {
    const pts = tileDiamond(gx, gy);
    const screenPts = [];
    for (let i = 0; i < pts.length; i += 2) {
      screenPts.push(pts[i] + this.originX, pts[i + 1] + this.originY);
    }

    // Damier subtil
    const isAlt = (gx + gy) % 2 === 0;
    g.fillStyle(isAlt ? COL_TILE_FILL : COL_TILE_FILL_ALT, 1);
    g.fillPoints(
      this.ptsToGeom(screenPts),
      true,
    );

    g.lineStyle(0.5, COL_TILE_STROKE, 0.4);
    g.strokePoints(
      this.ptsToGeom(screenPts),
      true,
    );
  }

  private drawObstacleBlock(gx: number, gy: number): void {
    const container = this.add.container(0, 0);
    container.setDepth(this.depthAt(gx, gy) + 1);

    const g = this.add.graphics();

    // 4 coins de la face du dessus
    const d = tileDiamond(gx, gy);
    const top    = { x: d[0] + this.originX, y: d[1] + this.originY - BLOCK_HEIGHT };
    const right  = { x: d[2] + this.originX, y: d[3] + this.originY - BLOCK_HEIGHT };
    const bottom = { x: d[4] + this.originX, y: d[5] + this.originY - BLOCK_HEIGHT };
    const left   = { x: d[6] + this.originX, y: d[7] + this.originY - BLOCK_HEIGHT };

    // Face gauche (left → bottom → bottom+h → left+h)
    g.fillStyle(COL_OBSTACLE_LEFT, 1);
    g.fillPoints(this.ptsToGeom([
      left.x, left.y,
      bottom.x, bottom.y,
      bottom.x, bottom.y + BLOCK_HEIGHT,
      left.x, left.y + BLOCK_HEIGHT,
    ]), true);
    g.lineStyle(0.5, COL_OBSTACLE_STROKE, 0.3);
    g.strokePoints(this.ptsToGeom([
      left.x, left.y,
      bottom.x, bottom.y,
      bottom.x, bottom.y + BLOCK_HEIGHT,
      left.x, left.y + BLOCK_HEIGHT,
    ]), true);

    // Face droite (bottom → right → right+h → bottom+h)
    g.fillStyle(COL_OBSTACLE_RIGHT, 1);
    g.fillPoints(this.ptsToGeom([
      bottom.x, bottom.y,
      right.x, right.y,
      right.x, right.y + BLOCK_HEIGHT,
      bottom.x, bottom.y + BLOCK_HEIGHT,
    ]), true);
    g.lineStyle(0.5, COL_OBSTACLE_STROKE, 0.3);
    g.strokePoints(this.ptsToGeom([
      bottom.x, bottom.y,
      right.x, right.y,
      right.x, right.y + BLOCK_HEIGHT,
      bottom.x, bottom.y + BLOCK_HEIGHT,
    ]), true);

    // Face du dessus (le losange surélevé)
    g.fillStyle(COL_OBSTACLE_TOP, 1);
    g.fillPoints(this.ptsToGeom([
      top.x, top.y,
      right.x, right.y,
      bottom.x, bottom.y,
      left.x, left.y,
    ]), true);
    g.lineStyle(0.5, COL_OBSTACLE_STROKE, 0.5);
    g.strokePoints(this.ptsToGeom([
      top.x, top.y,
      right.x, right.y,
      bottom.x, bottom.y,
      left.x, left.y,
    ]), true);

    container.add(g);
  }

  /** Convertit un tableau plat [x1,y1,x2,y2,...] en points Geom */
  private ptsToGeom(flat: number[]): Phaser.Geom.Point[] {
    const result: Phaser.Geom.Point[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      result.push(new Phaser.Geom.Point(flat[i], flat[i + 1]));
    }
    return result;
  }

  // ─── Sprites entités ───────────────────────────────────────

  private spawnEntitySprites(): void {
    const state = gameStore.battleState;
    if (!state) return;

    for (const entity of state.entities.values()) {
      this.createEntitySprite(entity);
    }
  }

  private createEntitySprite(entity: BattleEntity): void {
    const pos = this.entityScreen(entity.position.x, entity.position.y);
    const container = this.add.container(pos.x, pos.y);
    container.setDepth(this.depthAt(entity.position.x, entity.position.y) + 5);

    const isPlayer = entity.team === Team.Player;
    const mainColor = isPlayer ? COL_PLAYER : COL_ENEMY;
    const darkColor = isPlayer ? COL_PLAYER_DARK : COL_ENEMY_DARK;

    const body = this.add.graphics();

    // Ombre au sol (ellipse sombre)
    body.fillStyle(0x000000, 0.3);
    body.fillEllipse(0, ENTITY_HEIGHT / 2 + ENTITY_LIFT, ENTITY_RADIUS_X * 2.2, ENTITY_RADIUS_Y * 1.2);

    // Corps : capsule iso = rectangle arrondi écrasé verticalement
    // Base (ellipse sombre)
    body.fillStyle(darkColor, 1);
    body.fillEllipse(0, ENTITY_HEIGHT / 2, ENTITY_RADIUS_X * 2, ENTITY_RADIUS_Y * 2);

    // Cylindre (rect au milieu)
    body.fillStyle(mainColor, 1);
    body.fillRect(-ENTITY_RADIUS_X, -ENTITY_HEIGHT / 2, ENTITY_RADIUS_X * 2, ENTITY_HEIGHT);

    // Sommet (ellipse claire)
    body.fillStyle(mainColor, 1);
    body.fillEllipse(0, -ENTITY_HEIGHT / 2, ENTITY_RADIUS_X * 2, ENTITY_RADIUS_Y * 2);

    // Highlight
    body.fillStyle(0xffffff, 0.15);
    body.fillEllipse(-3, -ENTITY_HEIGHT / 2 - 1, ENTITY_RADIUS_X, ENTITY_RADIUS_Y * 0.8);

    // Contour
    body.lineStyle(1, 0xffffff, 0.2);
    body.strokeEllipse(0, -ENTITY_HEIGHT / 2, ENTITY_RADIUS_X * 2, ENTITY_RADIUS_Y * 2);

    container.add(body);

    // Nom (au-dessus)
    const nameText = this.add
      .text(0, -ENTITY_HEIGHT - 10, entity.name, {
        fontSize: '10px',
        color: '#e2e8f0',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
    container.add(nameText);

    // Barre de vie
    const hpBarBg = this.add.graphics();
    hpBarBg.fillStyle(0x1e293b, 1);
    hpBarBg.fillRect(-18, -ENTITY_HEIGHT - 2, 36, 5);
    container.add(hpBarBg);

    const hpBar = this.add.graphics();
    this.drawHpBar(hpBar, entity);
    container.add(hpBar);

    this.entitySprites.set(entity.id, container);
  }

  private drawHpBar(g: Phaser.GameObjects.Graphics, entity: BattleEntity): void {
    g.clear();
    const pct = entity.health.current / entity.health.max;
    const barColor = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xeab308 : 0xef4444;
    g.fillStyle(barColor, 1);
    g.fillRect(-18, -ENTITY_HEIGHT - 2, 36 * pct, 5);
  }

  /** Trie les sprites par profondeur (arrière → avant) */
  private sortDepth(): void {
    this.children.sort('depth');
  }

  // ─── Gestion des events ────────────────────────────────────

  private handleBattleEvents(events: BattleEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'ENTITY_MOVED':
          this.animateMove(event.entityId, event.to);
          break;
        case 'DAMAGE_TAKEN':
          this.animateDamage(event.targetId, event.amount, event.remainingHp);
          break;
        case 'HEAL_RECEIVED':
          this.animateHeal(event.targetId, event.amount, event.remainingHp);
          break;
        case 'ENTITY_DIED':
          this.animateDeath(event.entityId);
          break;
        case 'SPELL_CAST':
          this.animateSpellCast(event.casterId, event.targetPosition);
          break;
      }
    }
  }

  private animateMove(
    entityId: string,
    to: { x: number; y: number },
  ): void {
    const sprite = this.entitySprites.get(entityId);
    if (!sprite || !this.sys?.tweens) return;

    const pos = this.entityScreen(to.x, to.y);
    const newDepth = this.depthAt(to.x, to.y) + 5;

    this.tweens.add({
      targets: sprite,
      x: pos.x,
      y: pos.y,
      duration: 350,
      ease: 'Power2',
      onUpdate: () => {
        // Mise à jour progressive de la profondeur pour éviter le clipping
        sprite.setDepth(newDepth);
      },
      onComplete: () => {
        sprite.setDepth(newDepth);
        this.sortDepth();
      },
    });
  }

  private animateDamage(
    targetId: string,
    amount: number,
    _remainingHp: number,
  ): void {
    const sprite = this.entitySprites.get(targetId);
    if (!sprite) return;
    if (!this.sys?.displayList) return;

    // Flash
    this.tweens.add({
      targets: sprite,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
    });

    // Shake latéral iso
    const origX = sprite.x;
    this.tweens.add({
      targets: sprite,
      x: origX + 4,
      duration: 40,
      yoyo: true,
      repeat: 2,
      onComplete: () => { sprite.x = origX; },
    });

    // Texte dégâts (monte en iso = monte verticalement)
    const dmgText = this.add
      .text(sprite.x, sprite.y - ENTITY_HEIGHT - 20, `-${amount}`, {
        fontSize: '14px',
        color: '#ef4444',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(9999);

    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => {
        if (dmgText.active) dmgText.destroy();
      },
    });

    // Mise à jour barre de vie
    const entity = gameStore.battleState?.entities.get(targetId);
    if (entity) {
      const hpBar = sprite.list[3] as Phaser.GameObjects.Graphics;
      if (hpBar) this.drawHpBar(hpBar, entity);
    }
  }

  private animateHeal(
    targetId: string,
    amount: number,
    _remainingHp: number,
  ): void {
    const sprite = this.entitySprites.get(targetId);
    if (!sprite) return;
    if (!this.sys?.displayList) return;

    const healText = this.add
      .text(sprite.x, sprite.y - ENTITY_HEIGHT - 20, `+${amount}`, {
        fontSize: '14px',
        color: '#22c55e',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(9999);

    this.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => {
        if (healText.active) healText.destroy();
      },
    });
  }

  private animateDeath(entityId: string): void {
    const sprite = this.entitySprites.get(entityId);
    if (!sprite || !this.sys?.tweens) return;

    this.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      y: sprite.y + 10,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        if (sprite.active) sprite.destroy();
        this.entitySprites.delete(entityId);
      },
    });
  }

  private animateSpellCast(
    casterId: string,
    targetPos: { x: number; y: number },
  ): void {
    const sprite = this.entitySprites.get(casterId);
    if (!sprite) return;
    if (!this.sys?.displayList) return;

    const dest = this.entityScreen(targetPos.x, targetPos.y);

    // Projectile (orbe lumineuse)
    const projectile = this.add.graphics();
    projectile.fillStyle(0xfbbf24, 1);
    projectile.fillCircle(0, 0, 5);
    projectile.fillStyle(0xffffff, 0.6);
    projectile.fillCircle(0, -1, 2);
    projectile.setPosition(sprite.x, sprite.y - ENTITY_HEIGHT / 2);
    projectile.setDepth(9998);

    this.tweens.add({
      targets: projectile,
      x: dest.x,
      y: dest.y - ENTITY_HEIGHT / 2,
      duration: 250,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (projectile.active) projectile.destroy();
        if (!this.sys?.displayList) return;

        // Impact : flash elliptique iso
        const flash = this.add.graphics();
        flash.fillStyle(0xfbbf24, 0.4);
        flash.fillEllipse(dest.x, dest.y, 36, 18);
        flash.setDepth(9997);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 350,
          onComplete: () => {
            if (flash.active) flash.destroy();
          },
        });
      },
    });
  }
}
