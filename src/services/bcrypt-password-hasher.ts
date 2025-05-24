import bcrypt from 'bcrypt';
import { IPasswordHasher } from "../interfaces/password-hasher.interface";

export class BcryptPasswordHasher implements IPasswordHasher {
    constructor(private readonly saltRounds = 10) {}

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds)
    }
}