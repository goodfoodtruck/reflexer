import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'reflexer_secret'

export type AuthPayload = {
    userId: string
    name: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token manquant' })
        return
    }

    const token = header.split(' ')[1]!

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload
        req.user = payload
        next()
    } catch {
        res.status(401).json({ error: 'Token invalide ou expiré' })
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}
