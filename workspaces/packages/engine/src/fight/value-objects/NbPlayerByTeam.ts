export class NbPlayerByTeam {

    readonly value: number

    constructor(value: number) {
        if (! Number.isInteger(value) || value < 1 || value > 8) {
            throw new Error(`NbPlayerByTeam doit être un entier entre 1 et 8, reçu : ${value}`)
        }
        this.value = value
    }
}