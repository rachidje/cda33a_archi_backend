import { NextFunction, Request, Response } from "express";
import { User } from "../../entities/user.entity";
import container from "../config/dependency-injection";


export const bookSeat = async (
    req: Request,
    res: Response,
    next: NextFunction
) : Promise<any> => {
    try {
        const { conferenceId } = req.params

        const result = await container.resolve("bookSeat").execute({
            user: req.user as User,
            conferenceId
        })

        return res.jsonSuccess(result, 201)
    } catch (error) {
        next(error);
    }
};