export class ApiError extends Error {
    constructor(
        public readonly code: string,
        public readonly userMessage: string,
        public readonly status: number
    ) {
        super(code)
        this.name = "ApiError"
    }
}
