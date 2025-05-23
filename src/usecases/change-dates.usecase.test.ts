import { addDays, addHours } from "date-fns"
import { InMemoryBookingRepository } from "../repositories/in-memory-booking.repository"
import { InMemoryConferenceRepository } from "../repositories/in-memory-conference.repository"
import { InMemoryUserRepository } from "../repositories/in-memory-user-repository"
import { UnitBookings } from "../tests/seeds/unit-booking"
import { UnitConferences } from "../tests/seeds/unit-conferences"
import { UnitUsers } from "../tests/seeds/unit-users"
import { InMemoryMailer } from "../utils/in-memory-mailer"
import { ChangeDates } from "./change-dates.usecase"

describe("Change Dates", () => {
    let conferenceRepository: InMemoryConferenceRepository
    let bookingRepository: InMemoryBookingRepository
    let userRepository: InMemoryUserRepository
    let mailer: InMemoryMailer
    let usecase: ChangeDates


    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository();
        mailer = new InMemoryMailer();
        bookingRepository = new InMemoryBookingRepository()
        userRepository = new InMemoryUserRepository()
        usecase = new ChangeDates(
            conferenceRepository, 
            mailer,
            bookingRepository,
            userRepository
        );

        await conferenceRepository.save(UnitConferences.conference2)
        await userRepository.save(UnitUsers.alice);
        await userRepository.save(UnitUsers.bob);
        await bookingRepository.save(UnitBookings.bookingBob);
    })

    describe("Scenario: Conference does not exist", () => {
        const payload = {
            organizer: UnitUsers.alice,
            conferenceId: "non-existing-id",
            startDate: addDays(new Date(), 4),
            endDate: addDays(addHours(new Date(), 2), 4),
        }
        it("Should fail", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("Conference does not exist")
        })
    })

    describe("Scenario: update conference of someone else", () => {
        const payload = {
            organizer: UnitUsers.john,
            conferenceId: UnitConferences.conference2.props.id,
            startDate: addDays(new Date(), 4),
            endDate: addDays(addHours(new Date(), 2), 4),
        }
        it("Should fail", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("You are not allowed to change this conference")
        })
    })

    describe("Scenario: new dates are too soon", () => {
        const payload = {
            organizer: UnitUsers.alice,
            conferenceId: UnitConferences.conference2.props.id,
            startDate: addDays(new Date(), 2),
            endDate: addDays(addHours(new Date(), 2), 2),
        }
        it("Should fail", async () => {
            await expect(() => usecase.execute(payload)).rejects.toThrow("The conference must happen in at least 3 days")
        })
    })

    describe("Scenario: Happy path", () => {
        const payload = {
            organizer: UnitUsers.alice,
            conferenceId: UnitConferences.conference2.props.id,
            startDate: addDays(new Date(), 4),
            endDate: addDays(addHours(new Date(), 2), 4),
        }

        it("should update dates in db", async () => {
            await usecase.execute(payload);

            const updatedConference = await conferenceRepository.findById(UnitConferences.conference2.props.id);

            expect(updatedConference?.props.startDate).toEqual(payload.startDate);
            expect(updatedConference?.props.endDate).toEqual(payload.endDate);
        })

        it("should send email to participants", async () => {
            await usecase.execute(payload);

            expect(mailer.sentEmails).toEqual([
                {
                    to: UnitUsers.bob.props.email,
                    subject: `${UnitConferences.conference2.props.title} has changed`,
                    body: `The date of the conference ${UnitConferences.conference2.props.title} have changed`
                }
            ])
        })
    })
})