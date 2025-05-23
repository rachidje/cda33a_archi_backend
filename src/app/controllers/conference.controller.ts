import { NextFunction, Request, Response } from "express";
import { User } from "../../entities/user.entity";
import container from "../config/dependency-injection";
import { ChangeDatesDTO, ChangeSeatsDTO, CreateConferenceDTO } from "../dto/conference.dto";
import { RequestValidator } from "../utils/validate-requests";


export const organizeConference = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {errors, input} = await RequestValidator(CreateConferenceDTO, req.body);
        if(errors) return res.jsonError(errors, 400)

        const id = await container.resolve('organizeConference').execute({
            user: new User({id: "john-doe", email: 'johndoe@gmail.com', password: 'qwerty'}),
            title: input.title,
            seats: input.seats,
            startDate: input.startDate,
            endDate: input.endDate
        });

        return res.jsonSuccess({ id }, 201)
    } catch (error) {
        next(error)
    }
}

export const changeSeats = async (
    req: Request,
    res: Response,
    next: NextFunction
) : Promise<any> => {
    try {
        const { conferenceId } = req.params;
        const {errors, input } = await RequestValidator(ChangeSeatsDTO, req.body);

        if(errors) return res.jsonError(errors, 400)

        await container.resolve('changeSeats').execute({
            conferenceId,
            seats: input.seats,
            organizer: req.user as User
        })

        return res.jsonSuccess("Le nombre de places a bien ete mis a jour", 200)

    } catch (error) {
        next(error);
    }
};

export const changeDates = async (
    req: Request,
    res: Response,
    next: NextFunction
) : Promise<any> => {
    try {
        const { conferenceId } = req.params;
        const { errors, input } = await RequestValidator(ChangeDatesDTO, req.body);

        if(errors) return res.jsonError(errors, 400);

        await container.resolve('changeDates').execute({
            organizer: req.user as User,
            conferenceId,
            startDate: input.startDate,
            endDate: input.endDate
        })

        return res.jsonSuccess("Les dates ont bien ete modifies", 200)

    } catch (error) {
        next(error);
    }
};