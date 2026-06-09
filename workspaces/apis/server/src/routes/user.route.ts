import { Router } from 'express';
import { UserModel } from '../models/user.model';
import { NotificationModel } from '../models/notification.model';
import { requireAuth } from '../auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// Rechercher un joueur par pseudo
router.get('/search', async (req, res) => {
  const { name } = req.query as { name: string };  

  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'Paramètre name requis' });
    return;
  }

  const users = await UserModel.find(
    { name: { $regex: name.trim(), $options: 'i' } },
    { name: 1 }
  ).limit(10);

  res.json(users);
});

router.get('/notifications', requireAuth, async (req, res) => {
  const notifications = await NotificationModel.find({
    userId: req.user!.userId,
    read: false
  }).sort({ createdAt: -1 }); //  du plus récent au plus ancien

  res.json(notifications);
});

// TODO :  test à supprimer pls tard
router.post('/notifications/test', requireAuth, async (req, res) => {
    const notification = await NotificationModel.create({
        userId:   req.user!.userId,
        fromName: 'TestJoueur',
        fightId:  new mongoose.Types.ObjectId(),
        winner:   'ENEMY',
    })
    res.status(201).json(notification)
})

router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ error: 'Notification introuvable' });
    return;
  }

  res.json(notification);
});

export default router;



router.get("/:id", async (req, res) => {
  const user = await UserModel.findById(req.params.id, { name: 1 }); // return uniquement name
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});
