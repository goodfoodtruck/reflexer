import { NotificationModel } from "@models/notification.model"
import type { PlayingTeamID } from "@reflexer/engine"
import type { Types } from "mongoose"

type CreateNotificationData = {
    userId: string
    fromName: string
    fightId: Types.ObjectId
    winner: PlayingTeamID
}

export class NotificationRepository {
    async findUnreadByUserId(userId: string) {
        return NotificationModel.find({ userId, read: false }).sort({ createdAt: -1 })
    }

    async markAsRead(id: string, userId: string) {
        return NotificationModel.findOneAndUpdate(
            { _id: id, userId },
            { read: true },
            { new: true }
        )
    }

    async create(data: CreateNotificationData) {
        return NotificationModel.create(data)
    }
}