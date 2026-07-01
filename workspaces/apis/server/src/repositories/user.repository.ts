import { UserModel } from "@models/user.model"

type CreateUserData = {
    name: string
    password: string
    secretAnswer: string
}

export class UserRepository {
    async findById(id: string) {
        return UserModel.findById(id)
    }

    async findByName(name: string) {
        return UserModel.findOne({ name })
    }

    async create(data: CreateUserData) {
        return UserModel.create(data)
    }

    async findManyByIds(ids: string[]) {
        return UserModel.find({ _id: { $in: ids } }).select("-password -secretAnswer")
    }

    async search(name: string) {
        return UserModel.find(
            { name: { $regex: name.trim(), $options: 'i' } },
            { name: 1 }
        ).limit(10)
    }

    async updatePassword(id: string, hashedPassword: string) {
        return UserModel.findByIdAndUpdate(id, { password: hashedPassword })
    }
}