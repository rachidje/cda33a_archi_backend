import { Booking } from "../entities/booking.entity";

export interface IBookingRepository {
    save(booking: Booking) : Promise<void>
    getCountByConferenceId(conferenceId: string): Promise<number>
    findByConferenceId(conferenceId: string): Promise<Booking[]>
    findOne(userId: string, conferenceId: string): Promise<Booking | null>
    findById(id: string): Promise<Booking | null>
}