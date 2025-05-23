import { Model } from "mongoose";
import { User } from "../../entities/user.entity";
import { IUserRepository } from "../../interfaces/user-repository.interface";
import { MongoUser } from "./mongo-user.model";

class UserMapper {
    static toCore(document: MongoUser.UserDocument): User {
        return new User({
            id: document._id,
            email: document.email,
            password: document.password
        })
    }

    static toPersistence(user: User): InstanceType<typeof MongoUser.UserModel> {
        return new MongoUser.UserModel({
            _id: user.props.id,
            email: user.props.email,
            password: user.props.password
        })
    }
}


export class MongoUserRepository implements IUserRepository {
    constructor(private readonly model: Model<MongoUser.UserDocument>) {}

    async findByEmail(email: string): Promise<User | null> {
        const document = await this.model.findOne({email});
        if(!document) return null;
        return UserMapper.toCore(document)
    }

    async findById(id: string): Promise<User | null> {
        const document = await this.model.findById(id);
        if(!document) return null;
        return UserMapper.toCore(document);
    }

    async save(user: User): Promise<void> {
        const document = UserMapper.toPersistence(user)
        await document.save();
    }
}