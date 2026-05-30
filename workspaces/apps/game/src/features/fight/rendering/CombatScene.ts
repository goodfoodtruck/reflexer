import { Application, Container, Graphics } from "pixi.js"
import type { Ticker } from "pixi.js"
import type { FightSnapshot, Position, PlayingEntityID, EntitySnapshot } from "@reflexer/engine"

const CELL_SIZE = 64 // TODO Valeur de test -> Injecter vraie FightMap

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

    setup(snapshot: FightSnapshot) {
        this.drawGrid()
        for (const entity of snapshot.entities) {
            this.spawnEntity(entity)
        }
    }

    private drawGrid() {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const cell = new Graphics()
                cell.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                cell.stroke({ width: 1, color: 0x666688 })
                this.gridContainer.addChild(cell)
            }
        }
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