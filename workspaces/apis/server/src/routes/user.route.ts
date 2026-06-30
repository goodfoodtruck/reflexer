import e, { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { NotificationModel } from '../models/notification.model';
import { requireAuth } from '../auth.middleware';
import mongoose from 'mongoose';

const router = Router();

router.post("/batch", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body as { ids: string[] }
        const users = await UserModel.find({ _id: { $in: ids } }).select("-password -secretAnswer")
        res.json(users)
    } catch (error) {
        next(error)
    }
})

// Rechercher un joueur par pseudo
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query as { name: string };  
        if (! name || name.trim() === '') {
            res.status(400).json({ error: 'Paramètre name requis' });
            return;
        }

        const users = await UserModel.find(
            { name: { $regex: name.trim(), $options: 'i' } },
            { name: 1 }
        ).limit(10);

        res.json(users);
    } catch (error) {
        next(error)
    }
});


router.get('/notifications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationModel.find({
            userId: req.user!.userId,
            read: false
        }).sort({ createdAt: -1 }); //  du plus récent au plus ancien

        res.json(notifications);
    } catch (error) {
        next(error)
    }
});


router.patch('/notifications/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.userId },
            { read: true },
            { new: true }
        );

        if (! notification) {
            res.status(404).json({ error: 'Notification introuvable' });
            return;
        }

        res.json(notification);
    } catch (error) {
        next(error)
    }
});


router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserModel.findById(req.params.id, { name: 1 }); // return uniquement name
        if (! user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        next(error)
    }
});


export default router;
