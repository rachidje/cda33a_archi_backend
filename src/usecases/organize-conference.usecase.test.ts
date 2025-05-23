// payload => controller => usecase => repository => ID

import { addDays, addHours } from "date-fns";
import { InMemoryConferenceRepository } from "../repositories/in-memory-conference.repository";
import { FixedIDGenerator } from "../utils/fixed-id-generator";
import { OrganizeConference } from "./organize-conference.usecase";
import { User } from "../entities/user.entity";

describe("Organize conference", () => {
    const johnDoe = new User({id: "john-doe", email: 'johndoe@gmail.com', password: 'qwerty'})

    let usecase: OrganizeConference;
    let repository: InMemoryConferenceRepository;
    let idGenerator : FixedIDGenerator;

    beforeEach(() => {
        repository = new InMemoryConferenceRepository();
        idGenerator = new FixedIDGenerator();
        usecase = new OrganizeConference(repository, idGenerator)
    })

    describe("Scenario: Conference is too soon", () => {
        const payload = {
                user: johnDoe,
                title: "Python pour les nuls",
                seats: 100,
                startDate: new Date('2025-01-01T00:00:00.000Z'),
                endDate: new Date('2025-01-01T00:00:00.000Z')
        }
        it("should fail and throw an error", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("The conference must happen in at least 3 days")
        })
    })

    describe("Scenario: Conference has not enough seats", () => {
        const payload = {
                user: johnDoe,
                title: "Python pour les nuls",
                seats: 10,
                startDate: addDays(new Date(), 4),
                endDate: addDays(new Date(), 4)
        }

        it("should fail and throw an error", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Conference has not enough seats")
        } )
    })

    describe("Scenario: Conference has too much seats", () => {
        const payload = {
                user: johnDoe,
                title: "Python pour les nuls",
                seats: 150,
                startDate: addDays(new Date(), 4),
                endDate: addDays(new Date(), 4)
        }

        it("should fail and throw an error", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Conference has too much seats")
        } )
    })

    describe("Scenario: Conference is too long", () => {
        const payload = {
                user: johnDoe,
                title: "Python pour les nuls",
                seats: 50,
                startDate: addDays(new Date(), 4),
                endDate: addDays(addHours(new Date(), 4), 4)
        }

        it("should fail and throw an error", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Conference is too long")
        } )
    })

    describe("Scenario: Happy path", () => {
        const payload = {
                user: johnDoe,
                title: "Python pour les nuls",
                seats: 50,
                startDate: addDays(new Date(), 4),
                endDate: addDays(addHours(new Date(), 2), 4)
        }

        it("Should return an ID", async () => {
            const id = await usecase.execute(payload);
            expect(id).toEqual("1")
        })

        it("should save to DB", async () => {
            const id = await usecase.execute(payload);
            const fetchedConference = await repository.findById(id);

            expect(fetchedConference).not.toBeNull();
            expect(fetchedConference!.props.title).toEqual("Python pour les nuls")
        })
    })
})