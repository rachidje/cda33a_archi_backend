import { Booking } from "../entities/booking.entity";
import { IBookingRepository } from "../interfaces/booking-repository.interface";

export class InMemoryBookingRepository implements IBookingRepository {
    bookings: Booking[];

    constructor() {
        this.bookings = [];
    }

    async save(booking: Booking): Promise<void> {
        this.bookings.push(booking);
    }

    async getCountByConferenceId(conferenceId: string): Promise<number> {
        return this.bookings.filter(booking => booking.props.conferenceId === conferenceId).length
    }

    async findByConferenceId(conferenceId: string): Promise<Booking[]> {
        return this.bookings.filter(booking => booking.props.conferenceId === conferenceId)
    }

    async findOne(userId: string, conferenceId: string): Promise<Booking | null> {
        return this.bookings.find(booking => booking.props.conferenceId === conferenceId && booking.props.userId === userId) ?? null
    }

    async findById(id: string): Promise<Booking | null> {
        return this.bookings.find(booking => booking.props.id === id) ?? null
    }
}