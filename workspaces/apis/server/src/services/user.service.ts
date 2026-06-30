import { UserRepository } from "@repositories/user.repository"
import { NotificationRepository } from "@repositories/notification.repository"
import { AppError } from "../errors/AppError"

export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly notificationRepo: NotificationRepository
    ) {}

    async getUserById(id: string) {
        const user = await this.userRepo.findById(id)
        if (!user) throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable.")
        return { id: user._id, name: user.name }
    }

    async searchUsers(name: string) {
        return this.userRepo.search(name)
    }

    async getUsersByIds(ids: string[]) {
        return this.userRepo.findManyByIds(ids)
    }

    async getUnreadNotifications(userId: string) {
        return this.notificationRepo.findUnreadByUserId(userId)
    }

    async markNotificationRead(id: string, userId: string) {
        const notification = await this.notificationRepo.markAsRead(id, userId)
        if (!notification) throw new AppError(404, "NOTIFICATION_NOT_FOUND", "Notification introuvable.")
        return notification
    }
}
