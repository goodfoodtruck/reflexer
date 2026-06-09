import { Application, Container, Sprite, AnimatedSprite, Texture, Rectangle, Assets } from "pixi.js"
import type { Ticker } from "pixi.js"
import type {
    FightSnapshot,
    FightMapConfig,
    Position,
    PlayingEntityID,
    EntitySnapshot,
    EntityVisual,
    SpriteClip,
} from "@reflexer/engine"
import { EObstacleType } from "@reflexer/engine"
import { makeTween, type TweenFn } from "./animations/tween"
import { playMove } from "./animations/playMove"
import { playDeath } from "./animations/playDeath"
import { playPassive } from "./animations/playPassive"
import { playHitFlash } from "./animations/playHitFlash"
import { playLunge } from "./animations/playLunge"
import { resolveSpriteUrl, TILE_PATHS } from "./sprite-assets"

/** Taille d'une cellule en pixels (échelle de rendu, indépendante de la carte). */
export const CELL_SIZE = 64

/** Hauteur d'affichage cible du corps d'un combattant au repos (uniforme, quelle que soit l'échelle source). */
const COMBATANT_BODY_HEIGHT = CELL_SIZE * 0.85

const TILE_BY_OBSTACLE: Record<EObstacleType, string> = {
    [EObstacleType.FLOOR]: TILE_PATHS.floor,
    [EObstacleType.WALL]: TILE_PATHS.wall,
    [EObstacleType.HOLE]: TILE_PATHS.hole,
}

/** Vitesse d'animation Pixi (frames/tick @60fps) pour jouer un clip sur sa durée. */
function clipSpeed(clip: SpriteClip): number {
    return clip.frames / ((clip.durationMs / 1000) * 60)
}

export type VisualResolver = (entity: EntitySnapshot) => EntityVisual

export class CombatScene {
    private gridContainer = new Container()
    private entityContainer = new Container()
    private entities = new Map<PlayingEntityID, AnimatedSprite>()
    private visuals = new Map<PlayingEntityID, EntityVisual>()
    /** Frames découpées, mises en cache par chemin logique de clip. */
    private clipFrames = new Map<string, Texture[]>()
    private readonly tween: TweenFn

    private constructor(private readonly app: Application) {
        this.app.stage.addChild(this.gridContainer)
        this.app.stage.addChild(this.entityContainer)
        this.tween = makeTween(this.app.ticker)
    }

    static async create(mount: HTMLElement): Promise<CombatScene> {
        const app = new Application()
        await app.init({
            background: "#1a1a2e",
            resizeTo: mount,
            antialias: false,
        })
        mount.appendChild(app.canvas)
        return new CombatScene(app)
    }

    get ticker(): Ticker {
        return this.app.ticker
    }

    async setup(snapshot: FightSnapshot, map: FightMapConfig, getVisual: VisualResolver): Promise<void> {
        await this.drawGrid(map)
        for (const entity of snapshot.entities) {
            await this.spawnEntity(entity, getVisual(entity))
        }
    }

    private async drawGrid(map: FightMapConfig): Promise<void> {
        const tileTextures = new Map<string, Texture>()
        for (const path of Object.values(TILE_PATHS)) {
            tileTextures.set(path, await this.loadTexture(path))
        }

        map.cells.forEach((row, y) => {
            row.forEach((type, x) => {
                const tile = new Sprite(tileTextures.get(TILE_BY_OBSTACLE[type]))
                tile.x = x * CELL_SIZE
                tile.y = y * CELL_SIZE
                tile.width = CELL_SIZE
                tile.height = CELL_SIZE
                this.gridContainer.addChild(tile)
            })
        })
    }

    private async spawnEntity(entity: EntitySnapshot, visual: EntityVisual): Promise<void> {
        const frames = await this.loadClip(visual.idle)
        const sprite = new AnimatedSprite(frames)
        sprite.anchor.set(0.5, 0.5)

        const scale = COMBATANT_BODY_HEIGHT / visual.referenceHeight
        sprite.scale.set(scale)
        // Les ennemis (spawn à droite) regardent vers la gauche.
        if (entity.teamId === "ENEMY") sprite.scale.x = -scale

        const { x, y } = this.cellToPixel(entity.position)
        sprite.x = x
        sprite.y = y
        sprite.animationSpeed = clipSpeed(visual.idle)
        sprite.loop = true
        sprite.play()

        this.entityContainer.addChild(sprite)
        this.entities.set(entity.id, sprite)
        this.visuals.set(entity.id, visual)
    }

    // --- Lecture d'animations (durées et frames pilotées par la donnée) ----------

    async playAttack(sourceId: PlayingEntityID, targetId: PlayingEntityID): Promise<void> {
        const source = this.entities.get(sourceId)
        const attackClip = this.visuals.get(sourceId)?.attack
        if (source && attackClip) {
            await this.playOnce(sourceId, attackClip)
            await this.toIdle(sourceId)
        } else if (source) {
            await playLunge(this.tween, source, this.facing(sourceId))
        }

        const target = this.entities.get(targetId)
        const hurtClip = this.visuals.get(targetId)?.hurt
        if (target && hurtClip) {
            await this.playOnce(targetId, hurtClip)
            await this.toIdle(targetId)
        } else if (target) {
            await playHitFlash(this.tween, target)
        }
    }

    async playMove(entityId: PlayingEntityID, to: Position): Promise<void> {
        const sprite = this.entities.get(entityId)
        if (!sprite) return

        const moveClip = this.visuals.get(entityId)?.move
        if (moveClip) await this.startLoop(entityId, moveClip)
        await playMove(this.tween, sprite, this.cellToPixel(to))
        await this.toIdle(entityId)
    }

    async playDeath(entityId: PlayingEntityID): Promise<void> {
        const sprite = this.entities.get(entityId)
        if (!sprite) return

        const deathClip = this.visuals.get(entityId)?.death
        if (deathClip) {
            await this.playOnce(entityId, deathClip)
            sprite.visible = false
        } else {
            await playDeath(this.tween, sprite)
        }
    }

    async playPassive(targetId: PlayingEntityID): Promise<void> {
        const sprite = this.entities.get(targetId)
        if (sprite) await playPassive(this.tween, sprite)
    }

    /**
     * Pause passive de `ms` millisecondes, synchronisée sur le ticker (même
     * horloge que les animations). Sert au `CombatReplayer` à cadencer le combat
     * — et se figera avec le reste si le ticker est mis en pause.
     */
    async wait(ms: number): Promise<void> {
        await this.tween(ms, () => {})
    }

    /** Joue un clip une seule fois et attend sa durée (déclarée par la donnée). */
    private async playOnce(entityId: PlayingEntityID, clip: SpriteClip): Promise<void> {
        const sprite = this.entities.get(entityId)
        if (!sprite) return
        sprite.textures = await this.loadClip(clip)
        sprite.loop = false
        sprite.animationSpeed = clipSpeed(clip)
        sprite.gotoAndPlay(0)
        await this.tween(clip.durationMs, () => {})
    }

    private async startLoop(entityId: PlayingEntityID, clip: SpriteClip): Promise<void> {
        const sprite = this.entities.get(entityId)
        if (!sprite) return
        sprite.textures = await this.loadClip(clip)
        sprite.loop = true
        sprite.animationSpeed = clipSpeed(clip)
        sprite.gotoAndPlay(0)
    }

    private async toIdle(entityId: PlayingEntityID): Promise<void> {
        const visual = this.visuals.get(entityId)
        if (visual) await this.startLoop(entityId, visual.idle)
    }

    private facing(entityId: PlayingEntityID): 1 | -1 {
        const sprite = this.entities.get(entityId)
        return sprite && sprite.scale.x < 0 ? -1 : 1
    }

    // --- Chargement / découpe des textures ---------------------------------------

    private async loadClip(clip: SpriteClip): Promise<Texture[]> {
        const cached = this.clipFrames.get(clip.path)
        if (cached) return cached

        const base = await this.loadTexture(clip.path)
        const frames: Texture[] = []
        for (let i = 0; i < clip.frames; i++) {
            frames.push(
                new Texture({
                    source: base.source,
                    frame: new Rectangle(i * clip.frameWidth, 0, clip.frameWidth, clip.frameHeight),
                })
            )
        }
        this.clipFrames.set(clip.path, frames)
        return frames
    }

    private async loadTexture(logicalPath: string): Promise<Texture> {
        const texture = await Assets.load<Texture>(resolveSpriteUrl(logicalPath))
        texture.source.scaleMode = "nearest"
        return texture
    }

    // --- Accès géométriques (overlays HTML, etc.) --------------------------------

    getSprite(entityId: PlayingEntityID): Container | undefined {
        return this.entities.get(entityId)
    }

    /**
     * Position de l'entité en pixels écran (coordonnées du canvas), pour aligner
     * un overlay HTML au-dessus du sprite. `null` si l'entité n'existe pas.
     */
    getEntityScreenPosition(entityId: PlayingEntityID): { x: number; y: number } | null {
        const sprite = this.entities.get(entityId)
        if (!sprite) return null
        return { x: sprite.x, y: sprite.y }
    }

    get cellSize(): number {
        return CELL_SIZE
    }

    cellToPixel(position: Position): { x: number; y: number } {
        return {
            x: position.x * CELL_SIZE + CELL_SIZE / 2,
            y: position.y * CELL_SIZE + CELL_SIZE / 2,
        }
    }

    destroy() {
        this.app.destroy(true, { children: true })
        this.entities.clear()
        this.visuals.clear()
        this.clipFrames.clear()
    }
}
