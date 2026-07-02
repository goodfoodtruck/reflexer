import { Router } from "express"

export abstract class AController {
    protected router: Router

    constructor() {
        this.router = Router()
    }

    getRouter(): Router {
        return this.router
    }
}