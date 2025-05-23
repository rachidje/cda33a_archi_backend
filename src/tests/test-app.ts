import express, { Application } from "express";
import mongoose from "mongoose";
import container from "../app/config/dependency-injection";
import { config } from "../app/config/get-env";
import { errorHandlerMiddleware } from "../app/middlewares/error-handler.middleware";
import { jsonReponseMiddleware } from "../app/middlewares/json-response.middleware";
import { ConferenceRoute } from "../app/routes/conference.routes";
import { Container } from "../types/container.type";
import { IFixture } from "./fixtures/fixture.interface";
import { BookingRoute } from "../app/routes/booking.routes";

export class TestApp {
    private app : Application
    private container : Container

    constructor() {
        this.app = express();
        this.container = container
    }

    async setup() {
        await mongoose.connect(config.dbUrl);
        await mongoose.connection.db?.collection('users').deleteMany({});

        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(jsonReponseMiddleware);
        this.app.use(ConferenceRoute);
        this.app.use(BookingRoute);
        this.app.use(errorHandlerMiddleware);
    }

    async teardown() {
        await mongoose.connection.close();
    }

    async loadFixtures(fixtures: IFixture[]) {
        return Promise.all(fixtures.map(fixture => fixture.load(container)))
    }

    get expressApp() {
        return this.app
    }

    get containerDI() {
        return this.container;
    }
}