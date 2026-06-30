import { Request, Response, NextFunction } from "express"
import logger from "../logger"

export function errorMiddleware(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const status: number = err.status || 500

    if (status >= 500) {
        logger.error(`${req.method} ${req.url} — ${err.message}`, { stack: err.stack, status })
    } else {
        logger.warn(`${req.method} ${req.url} — ${err.message}`, { status })
    }

    res.status(status).json({
        success: false,
        message: status >= 500 ? "Internal Server Error" : (err.message || "Error"),
    })
}