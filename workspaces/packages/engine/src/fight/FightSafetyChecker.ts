export class FightSafetyChecker {

    constructor(
        private readonly MAX_TURNS: number,
        private readonly MAX_CYCLE_LENGTH: number,
        private readonly CYCLE_REPETITIONS: number
    ) {}

    /**
     * Vérifie si une boucle de tour est détectée pendant un combat 
     * ou si on a atteint un nombre X de tours
     * @param hashedTurnLogs 
     * @returns 
     */
    isFightStuck(hashedTurnLogs: string[]): boolean {
        if (hashedTurnLogs.length >= this.MAX_TURNS) 
            return true
        return this.hasRepeatingCycle(hashedTurnLogs)
    }

    /**
     * Détecte si les derniers tours du combat forment un cycle qui se répète,
     * signe d'un combat bloqué dans une boucle.
     *
     * Teste toutes les longueurs de cycle possibles, de 1 tour jusqu'à
     * MAX_CYCLE_LENGTH. Par exemple un cycle de longueur 2 détecte un combat
     * où deux tours s'alternent indéfiniment (A, B, A, B, A, B).
     *
     * @param hashedTurnLogs - L'historique des tours, chacun réduit à une signature hashée
     * @returns true si un cycle répété est détecté, false sinon
     */
    private hasRepeatingCycle(hashedTurnLogs: string[]): boolean {
        for (let cycleLength = 1; cycleLength <= this.MAX_CYCLE_LENGTH; cycleLength++) {
            if (this.isCycleRepeating(hashedTurnLogs, cycleLength, this.CYCLE_REPETITIONS)) {
                return true
            }
        }

        return false
    }

    /**
     * Vérifie si les derniers tours forment un motif de `cycleLength` tours
     * qui se répète exactement `repetitions` fois d'affilée.
     *
     * Le principe : on isole les derniers tours nécessaires, puis on vérifie
     * que chaque tour est identique au tour correspondant dans le premier motif.
     *
     * @example
     * // motif [A, B] répété 3 fois
     * isCycleRepeating(["A", "B", "A", "B", "A", "B"], 2, 3) // → true
     *
     * @example
     * // le motif est brisé au dernier tour
     * isCycleRepeating(["A", "B", "A", "B", "A", "C"], 2, 3) // → false
     *
     * @param hashes - L'historique des tours hashés
     * @param cycleLength - La longueur du motif recherché (en nombre de tours)
     * @param repetitions - Combien de fois le motif doit se répéter pour être un cycle
     * @returns true si le motif se répète exactement, false sinon
     */
    private isCycleRepeating(hashes: string[], cycleLength: number, repetitions: number): boolean {
        const turnsNeededForCycle = cycleLength * repetitions
        if (hashes.length < turnsNeededForCycle) return false

        const lastTurns = hashes.slice(-turnsNeededForCycle)
        const referencePattern = lastTurns.slice(0, cycleLength)

        for (let turnIndex = 0; turnIndex < lastTurns.length; turnIndex++) {
            const positionInPattern = turnIndex % cycleLength
            const currentTurn = lastTurns[turnIndex]
            const expectedTurn = referencePattern[positionInPattern]

            if (currentTurn !== expectedTurn) {
                return false
            }
        }

        return true
    }
}