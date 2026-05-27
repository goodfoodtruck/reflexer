import { Application, Container, Sprite, Assets, Graphics } from "pixi.js"
import type { FightSnapshot, Position, PlayingEntityID, EntitySnapshot } from "@reflexer/engine"

const CELL_SIZE = 64 // TODO Valeur de test -> Injecter vraie FightMap

export class CombatScene {
    private gridContainer = new Container()
    private entityContainer = new Container()
    private sprites = new Map<PlayingEntityID, Sprite>()

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

    private async spawnEntity(entity: EntitySnapshot): Promise<void> {
        const texturePath = entity.teamId === "PLAYER"
            ? "/assets/hero.png"
            : "/assets/enemy.png"

        const texture = await Assets.load(texturePath)
        const sprite = new Sprite(texture)

        sprite.anchor.set(0.5)
        const { x, y } = this.cellToPixel(entity.position)
        sprite.x = x
        sprite.y = y
        sprite.width = CELL_SIZE * 0.8
        sprite.height = CELL_SIZE * 0.8

        this.entityContainer.addChild(sprite)
        this.sprites.set(entity.id, sprite)
    }

    cellToPixel(position: Position): { x: number; y: number } {
        return {
            x: position.x * CELL_SIZE + CELL_SIZE / 2,
            y: position.y * CELL_SIZE + CELL_SIZE / 2
        }
    }

    destroy() {
        this.app.destroy(true, { children: true })
        this.sprites.clear()
    }
}