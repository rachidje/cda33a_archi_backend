import { InMemoryBookingRepository } from "../repositories/in-memory-booking.repository";
import { InMemoryConferenceRepository } from "../repositories/in-memory-conference.repository";
import { InMemoryUserRepository } from "../repositories/in-memory-user-repository";
import { UnitBookings } from "../tests/seeds/unit-booking";
import { UnitConferences } from "../tests/seeds/unit-conferences";
import { UnitUsers } from "../tests/seeds/unit-users";
import { FixedIDGenerator } from "../utils/fixed-id-generator";
import { InMemoryMailer } from "../utils/in-memory-mailer";
import { BookSeat } from "./book-seat.usecase";

describe('Feature: Book conference', () => {
    let usecase: BookSeat;
    let bookingRepository: InMemoryBookingRepository;
    let conferenceRepository: InMemoryConferenceRepository;
    let userRepository: InMemoryUserRepository;
    let mailer: InMemoryMailer;
    let idGenerator: FixedIDGenerator;

    beforeEach(async () => {
        bookingRepository = new InMemoryBookingRepository()
        await bookingRepository.save(UnitBookings.bookingBob)
        await bookingRepository.save(UnitBookings.bookingCharles)

        conferenceRepository = new InMemoryConferenceRepository()
        await conferenceRepository.save(UnitConferences.conference1)
        await conferenceRepository.save(UnitConferences.conference2)
        await conferenceRepository.save(UnitConferences.conferenceWithFewSeats)

        userRepository = new InMemoryUserRepository()
        await userRepository.save(UnitUsers.john)
        await userRepository.save(UnitUsers.alice)
        await userRepository.save(UnitUsers.bob)

        mailer = new InMemoryMailer()
        idGenerator = new FixedIDGenerator()

        usecase = new BookSeat(
            conferenceRepository,
            bookingRepository, 
            idGenerator,
            mailer, 
            userRepository
        )
    })


    describe('Scenario: Conference does not exist', () => {
        const payload = {
            user: UnitUsers.bob,
            conferenceId: 'non-existing-id'
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('Conference does not exist')
        }) 
    })
    
    describe('Scenario: Conference is full', () => {
        // Alice veut s'inscrire dans une conference qui n'a plus de place (Charles etant inscrit)
        const payload = {
            user: UnitUsers.alice,
            conferenceId: UnitConferences.conferenceWithFewSeats.props.id
        }
        
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('The conference is full')
        })
    })

    describe('Scenario: the user already participates to the conference', () => {
        // Bob veut s'inscrire dans la conference 2, mais il a deja booker sur cette conference
        const payload = {
            user: UnitUsers.bob,
            conferenceId: UnitConferences.conference2.props.id
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("You have already booked this conference")
        })
    })

    describe('Scenario: Happy path', () => {
        // Bob s'inscrit dans la conference 1, un ID est generer, il recoit un mail et l'organisateur (john) recoit egalement un mail
        const payload = {
            user: UnitUsers.bob,
            conferenceId: UnitConferences.conference1.props.id
        }
        
        it('should return bookId', async () =>{
            const result = await usecase.execute(payload);
            expect(result).toEqual({bookId: "1"})
        })

        it("should save the booking", async () => {
            const result = await usecase.execute(payload);
            const savedBooking = await bookingRepository.findById(result.bookId)

            expect(savedBooking).toBeDefined();
            expect(savedBooking?.props).toEqual({
                id: result.bookId,
                userId: UnitUsers.bob.props.id,
                conferenceId: UnitConferences.conference1.props.id
            })
        })

        it('should send an email to the organizer', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[0]).toEqual({
                to: UnitUsers.john.props.email,
                subject: 'New booking',
                body: `An user has booked your conference: ${UnitConferences.conference1.props.title}`
            })
        })

        it('should send an email to the participant', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[1]).toEqual({
                to: UnitUsers.bob.props.email,
                subject: 'New booking',
                body: `Confirmation of your booking for the conference: ${UnitConferences.conference1.props.title}`
            })
        })
    })
})