export class AppError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        public readonly userMessage: string
    ) {
        super(code)
        this.name = "AppError"
    }
}