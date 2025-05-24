import { InMemoryBookingRepository } from "../repositories/in-memory-booking.repository"
import { InMemoryUserRepository } from "../repositories/in-memory-user-repository"
import { BcryptPasswordHasher } from "../services/bcrypt-password-hasher"
import { UnitUsers } from "../tests/seeds/unit-users"
import { FixedIDGenerator } from "../utils/fixed-id-generator"
import { UserRegistration } from "./user-registration.usecase"

describe("User Registration", () => {
    let userRepository: InMemoryUserRepository
    let idGenerator: FixedIDGenerator
    let passwordHasher: BcryptPasswordHasher
    let usecase: UserRegistration

    beforeEach(async () => {
        userRepository = new InMemoryUserRepository()
        await userRepository.save(UnitUsers.alice)

        idGenerator = new FixedIDGenerator()
        passwordHasher = new BcryptPasswordHasher()
        usecase = new UserRegistration(userRepository, idGenerator, passwordHasher)
    })
    
    describe("Scenario: Email already exist", () => {
        const payload = {
                email: UnitUsers.alice.props.email,
                password: UnitUsers.alice.props.password
            }

        it("should fail and throw an error", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Email already exists")
        })
    })

    describe("Scenatio: Weak password", () => {
        const payload = {
                email: UnitUsers.bob.props.email,
                password: UnitUsers.bob.props.password
            }
        it("should fail and throw an WeakPasswordError", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Weak password error");
        })
    })

    describe("Scenario: Missing required fields", () => {
        const payload = {
                email: "",
                password: ""
            }
        it("should fail when email is missing", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Missing field required");
        })

        it("should fail when password is missing", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Missing field required");
        })
    })

    describe("Scenario: Valid registration", () => {
        const payload = {
            email: UnitUsers.userWithStrongPassword.props.email,
            password: UnitUsers.userWithStrongPassword.props.password,
        }

        it("return the new user ID", async () => {
            const result = await usecase.execute(payload);

            expect(result).toEqual({userId: expect.any(String)})
        })

        it("should save the user into db", async () => {
            const result = await usecase.execute(payload);

            const fetchedUser = await userRepository.findById(result.userId);

            expect(fetchedUser).toBeDefined();
            expect(fetchedUser?.props.id).toEqual(result.userId)
        })


        it("should hash password", async () => {
            const result = await usecase.execute(payload);
            const fetchedUser = await userRepository.findById(result.userId);

            expect(fetchedUser).toBeDefined();
            expect(fetchedUser?.props.password).not.toEqual(payload.password);
        })
    })
})