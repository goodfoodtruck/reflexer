export class InitiativeOrderIndex {
    readonly value: number

    constructor(value: number, private readonly MAX: number) {
        if (!Number.isInteger(value) || value < 0 || value >= MAX) {
            throw new Error(`InitiativeOrderIndex doit être un entier entre 0 et ${MAX - 1}, reçu : ${value}`)
        }
        this.value = value
    }

    next(): InitiativeOrderIndex {
        return new InitiativeOrderIndex((this.value + 1) % this.MAX, this.MAX)
    }
}