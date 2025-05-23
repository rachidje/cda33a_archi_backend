import { Router } from "express";
import { organizeConference, changeSeats, changeDates } from "../controllers/conference.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

router.get('/conferences');
router.use(authenticationMiddleware);
router.post("/conferences", organizeConference);
router.put("/conferences/:conferenceId/seats", changeSeats)
router.put("/conferences/:conferenceId/dates", changeDates)

export {router as ConferenceRoute};