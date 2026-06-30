import { Request, Response, NextFunction } from "express"
import logger from "../logger"
import { AppError } from "../errors/AppError"

export function errorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        if (err.status >= 500) {
            logger.error(`${req.method} ${req.url} — ${err.code}`, { stack: err.stack, status: err.status })
        } else {
            logger.warn(`${req.method} ${req.url} — ${err.code}`, { status: err.status })
        }

        res.status(err.status).json({
            success: false,
            code: err.code,
            message: err.userMessage
        })
        return
    }

    const error = err as any
    logger.error(`${req.method} ${req.url} — ${error?.message ?? "Unknown error"}`, {
        stack: error?.stack,
        status: 500
    })

    res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Une erreur interne est survenue."
    })
}