import { UserRepository } from "@repositories/user.repository"
import { NotificationRepository } from "@repositories/notification.repository"

export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly notificationRepo: NotificationRepository
    ) {}

    async getUserById(id: string) {
        const user = await this.userRepo.findById(id)
        if (!user) throw Object.assign(new Error("User not found"), { status: 404 })
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
        if (!notification) throw Object.assign(new Error("Notification introuvable"), { status: 404 })
        return notification
    }
}
