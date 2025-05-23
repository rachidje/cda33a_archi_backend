import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { bookSeat } from "../controllers/booking.controller";

const router = Router()

router.use(authenticationMiddleware)
router.post("/conference/:conferenceId/book", bookSeat)

export {router as BookingRoute}