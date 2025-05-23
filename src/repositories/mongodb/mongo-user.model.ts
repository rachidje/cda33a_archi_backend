import mongoose, { Document, Schema } from "mongoose";

export namespace MongoUser {
    export const CollectionName = 'users';

    export interface UserDocument extends Document {
        id: string
        email: string
        password: string
    }

    export const UserSchema = new Schema<UserDocument>({
        id: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true}
    })

    export const UserModel = mongoose.model<UserDocument>(CollectionName, UserSchema);
}