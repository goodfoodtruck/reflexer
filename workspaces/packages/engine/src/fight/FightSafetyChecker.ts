export class FightSafetyChecker {

    constructor(
        private readonly MAX_TURNS: number,
        private readonly MAX_CYCLE_LENGTH: number,
        private readonly CYCLE_REPETITIONS: number
    ) {}

    isFightStuck(hashedTurnLogs: string[]): boolean {
        if (hashedTurnLogs.length >= this.MAX_TURNS) 
            return true
        return this.hasRepeatingCycle(hashedTurnLogs)
    }

    private hasRepeatingCycle(hashedTurnLogs: string[]): boolean {
        // on teste chaque longueur de cycle possible
        for (let cycleLength = 1; cycleLength <= this.MAX_CYCLE_LENGTH; cycleLength++) {
            if (this.isCycleRepeating(hashedTurnLogs, cycleLength, this.CYCLE_REPETITIONS)) {
                return true
            }
        }

        return false
    }

    private isCycleRepeating(hashes: string[], cycleLength: number, repetitions: number): boolean {
        const needed = cycleLength * repetitions
        if (hashes.length < needed) return false

        // on regarde les `needed` derniers tours
        const recent = hashes.slice(-needed)

        // chaque position doit correspondre à la même position dans le premier cycle
        for (let i = cycleLength; i < recent.length; i++) {
            if (recent[i] !== recent[i % cycleLength]) {
                return false
            }
        }

        return true
    }
}