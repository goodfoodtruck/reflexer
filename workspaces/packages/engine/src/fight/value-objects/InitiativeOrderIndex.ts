export class InitiativeOrderIndex {
    static readonly MAX = 15  // 16 entités max (8 par équipe), index 0-15

    readonly value: number

    constructor(value: number) {
        if (! Number.isInteger(value) || value < 0 || value > InitiativeOrderIndex.MAX) {
            throw new Error(`InitiativeOrderIndex doit être un entier entre 0 et ${InitiativeOrderIndex.MAX}, reçu : ${value}`)
        }
        this.value = value
    }

    next(): InitiativeOrderIndex {
        return new InitiativeOrderIndex((this.value + 1) % (InitiativeOrderIndex.MAX + 1))
    }
}