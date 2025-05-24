import { User } from "../entities/user.entity";
import { IIDGenerator } from "../interfaces/id-generator.interface";
import { IPasswordHasher } from "../interfaces/password-hasher.interface";
import { IUsecase } from "../interfaces/usecase.interface";
import { IUserRepository } from "../interfaces/user-repository.interface";

interface UserRegistrationRequest {
    email: string
    password: string
}

type UserRegistrationRespone = {
    userId: string
}

export class UserRegistration implements IUsecase<UserRegistrationRequest, UserRegistrationRespone> {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly idGenerator: IIDGenerator,
        private readonly passwordHasher: IPasswordHasher
    ) {}

    async execute(data: UserRegistrationRequest): Promise<UserRegistrationRespone> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) throw new Error("Email already exists");

        const userId = this.idGenerator.generate()
        let user = new User({id: userId, ...data})

        user.validateOrThrow();

        const hashedPassword = await this.passwordHasher.hash(user.props.password);
        user = user.withHashedPassword(hashedPassword);

        await this.userRepository.save(user);

        return { userId }
    }
}