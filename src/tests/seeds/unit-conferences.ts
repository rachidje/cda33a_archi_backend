import { addDays, addHours } from "date-fns";
import { Conference } from "../../entities/conference.entity";
import { UnitUsers } from "./unit-users";

export const UnitConferences = {
    conference1: new Conference({
        id: 'conf-1',
        title: "Conference 1",
        seats: 50,
        startDate: addDays(addHours(new Date(), 2), 4),
        endDate: addDays(addHours(new Date(), 2), 4),
        organizerId: UnitUsers.john.props.id,
    }),

    conference2: new Conference({
        id: 'conf-2',
        title: "Conference 2",
        seats: 50,
        startDate: addDays(addHours(new Date(), 2), 4),
        endDate: addDays(addHours(new Date(), 2), 4),
        organizerId: UnitUsers.alice.props.id,
    }),

    conferenceWithFewSeats: new Conference({
        id: 'id-2',
        title: 'My first conference',
        seats: 1,
        startDate: addDays(addHours(new Date(), 2), 4),
        endDate: addDays(addHours(new Date(), 2), 4),
        organizerId: UnitUsers.alice.props.id,
    }),
}