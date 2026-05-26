import type {FightResult} from "@reflexer/engine";
import type {LogInterpreter} from "./LogInterpreter.ts";
import type {AnimationQueue} from "./AnimationQueue.ts";

export class CombatReplayer {
    constructor(
        private readonly scene: CombatScene,
        private readonly interpreter: LogInterpreter,
        private readonly animationQueue: AnimationQueue
    ) {}

    async play(result: FightResult): Promise<void> {
        this.scene.setup(result.initialState)

        for (const turn of result.logs) {
            for (const log of turn.actionLogs) {
                const command = this.interpreter.interpret(log)
                await this.animationQueue.run(command)
            }
        }
    }
}