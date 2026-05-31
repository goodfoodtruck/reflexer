import { Application, Container, Graphics } from "pixi.js"
import type { Ticker } from "pixi.js"
import type { FightSnapshot, FightMapConfig, Position, PlayingEntityID, EntitySnapshot } from "@reflexer/engine"
import { EObstacleType } from "@reflexer/engine"

/** Taille d'une cellule en pixels (échelle de rendu, indépendante de la carte). */
export const CELL_SIZE = 64

const CELL_COLORS: Record<EObstacleType, number> = {
    [EObstacleType.FLOOR]: 0x252544,
    [EObstacleType.WALL]: 0x44446a,
    [EObstacleType.HOLE]: 0x0d0d1a,
}

export class CombatScene {
    private gridContainer = new Container()
    private entityContainer = new Container()
    private entities = new Map<PlayingEntityID, Container>()

    private constructor(
        private readonly app: Application
    ) {
        this.app.stage.addChild(this.gridContainer)
        this.app.stage.addChild(this.entityContainer)
    }

    static async create(mount: HTMLElement): Promise<CombatScene> {
        const app = new Application()
        await app.init({
            background: "#1a1a2e",
            resizeTo: mount,
            antialias: true
        })
        mount.appendChild(app.canvas)
        return new CombatScene(app)
    }

    get ticker(): Ticker {
        return this.app.ticker
    }

    setup(snapshot: FightSnapshot, map: FightMapConfig) {
        this.drawGrid(map)
        for (const entity of snapshot.entities) {
            this.spawnEntity(entity)
        }
    }

    private drawGrid(map: FightMapConfig) {
        map.cells.forEach((row, y) => {
            row.forEach((type, x) => {
                const cell = new Graphics()
                cell.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                cell.fill(CELL_COLORS[type])
                cell.stroke({ width: 1, color: 0x666688 })
                this.gridContainer.addChild(cell)
            })
        })
    }

    private spawnEntity(entity: EntitySnapshot): void {
        const color = entity.teamId === "PLAYER" ? 0x4488ff : 0xff4444
        const g = new Graphics()
        g.rect(-CELL_SIZE * 0.4, -CELL_SIZE * 0.4, CELL_SIZE * 0.8, CELL_SIZE * 0.8)
        g.fill(color)

        const { x, y } = this.cellToPixel(entity.position)
        g.x = x
        g.y = y

        this.entityContainer.addChild(g)
        this.entities.set(entity.id, g)
    }

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
            y: position.y * CELL_SIZE + CELL_SIZE / 2
        }
    }

    destroy() {
        this.app.destroy(true, { children: true })
        this.entities.clear()
    }
}