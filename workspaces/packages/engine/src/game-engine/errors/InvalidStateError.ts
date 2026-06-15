export class InvalidStateError extends Error {
    constructor(reason: string) {
        super(`INVALID STATE ERROR : ${reason}`)
    }
}