import { Model } from "mongoose";
import { TestApp } from "../test-app"
import { MongoUser } from "../../repositories/mongodb/mongo-user.model";
import { MongoUserRepository } from "../../repositories/mongodb/mongo-user-repository";
import { E2eUsers } from "../seeds/e2e-users";

describe("Mongo User Repository", () => {
    let testApp: TestApp;
    let model: Model<MongoUser.UserDocument>;
    let repository: MongoUserRepository

    beforeEach(async () => {
        testApp = new TestApp();
        await testApp.setup();

        model = MongoUser.UserModel;
        repository = new MongoUserRepository(model)

        const document = new model({
                id: E2eUsers.alice.entity.props.id,
                email: E2eUsers.alice.entity.props.email,
                password: E2eUsers.alice.entity.props.password,
            })

        await document.save();
    })

    afterAll(async () => {
        await testApp.teardown();
    })

    describe("Scenario: Find by email", () => {
        it("should find user corresponding to email", async () => {
            const user = await repository.findByEmail(E2eUsers.alice.entity.props.email);
            expect(user?.props).toEqual(E2eUsers.alice.entity.props)
        })
        it("should return null if no user if found", async () => {
            const user = await repository.findByEmail("non-existing@gmail.com");
            expect(user).toBeNull()
        })
    })

    describe("Scenario: Create user", () => {
        it("should create a new user", async () => {
            await repository.save(E2eUsers.john.entity)
            
            const document = await model.findOne({id: E2eUsers.john.entity.props.id})

            expect(document?.toObject()).toEqual({
                id: E2eUsers.john.entity.props.id,
                email: E2eUsers.john.entity.props.email,
                password: E2eUsers.john.entity.props.password,
                __v: 0
            })
        })
    })
})