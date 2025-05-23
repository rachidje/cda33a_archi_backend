import { Booking } from "../entities/booking.entity";
import { Conference } from "../entities/conference.entity";
import { User } from "../entities/user.entity";
import { ConferenceNotFoundError } from "../exceptions/conference-not-exists.exception";
import { IBookingRepository } from "../interfaces/booking-repository.interface";
import { IConferenceRepository } from "../interfaces/conference-repository.interface";
import { IIDGenerator } from "../interfaces/id-generator.interface";
import { IMailer } from "../interfaces/mailer.interface";
import { IUsecase } from "../interfaces/usecase.interface";
import { IUserRepository } from "../interfaces/user-repository.interface";

type BookSeatRequest = {
    conferenceId: string;
    user: User
}

type BookSeatResponse = {
    bookId: string;
};

export class BookSeat implements IUsecase<BookSeatRequest, BookSeatResponse> {

    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly bookingRepository: IBookingRepository,
        private readonly idGenerator: IIDGenerator,
        private readonly mailer: IMailer,
        private userRepository: IUserRepository
    ) {}

    async execute(data: BookSeatRequest): Promise<BookSeatResponse> {
        const bookId = this.idGenerator.generate()
        const conference = await this.conferenceRepository.findById(data.conferenceId);

        if(!conference) throw new ConferenceNotFoundError();

        await this.assertSeatsAreAvailable(conference);
        await this.assertUserIsNotAlreadyBook(data.user, conference)
        
        const booking = new Booking({
            id: bookId,
            userId: data.user.props.id,
            conferenceId: data.conferenceId
        })

        await this.bookingRepository.save(booking);

        await this.sendEmailToOrganizer(conference);
        await this.sendEmailToParticipant(data.user, conference);

        return { bookId }
    }

    private async assertSeatsAreAvailable(conference: Conference) {
        const bookingCount = await this.bookingRepository.getCountByConferenceId(conference.props.id);

        if(bookingCount >= conference.props.seats) throw new Error("The conference is full");
    }

    private async assertUserIsNotAlreadyBook(user: User, conference: Conference) {
        const existingBooking = await this.bookingRepository.findOne(user.props.id, conference.props.id)
        if(existingBooking) throw new Error("You have already booked this conference")
    }

    private async sendEmailToOrganizer(conference: Conference) {
        const organizer = await this.userRepository.findById(conference.props.organizerId)

        this.mailer.send({
            to: organizer!.props.email,
            subject: 'New booking',
            body: `An user has booked your conference: ${conference.props.title}`
        })
    }

    private async sendEmailToParticipant(user: User, conference: Conference) {
        this.mailer.send({
            to: user.props.email,
            subject: 'New booking',
            body: `Confirmation of your booking for the conference: ${conference.props.title}`
        })
    }
}