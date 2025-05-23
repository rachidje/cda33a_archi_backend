import express from 'express';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { jsonReponseMiddleware } from './middlewares/json-response.middleware';
import { ConferenceRoute } from './routes/conference.routes';
import dotenv from 'dotenv'
import { BookingRoute } from './routes/booking.routes';
dotenv.config()

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(jsonReponseMiddleware);
app.use(ConferenceRoute);
app.use(BookingRoute);

app.use(errorHandlerMiddleware);

export default app;