import { addDays, addHours } from 'date-fns';
import { Application } from 'express';
import request from 'supertest';
import { E2eUsers } from '../seeds/e2e-users';
import { TestApp } from '../test-app';
import { E2eConferences } from '../seeds/e2e-conferences';

describe("Usecase: Change Dates", () => {

    let testApp: TestApp;
    let app: Application

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        app = testApp.expressApp
        await testApp.loadFixtures([
            E2eUsers.john,
            E2eConferences.conference1
        ])
    })

    afterAll(async() => {
        await testApp.teardown()
    })

    it("should change the dates", async () => {
        const conferenceId = E2eConferences.conference1.entity.props.id;
        const startDate = addDays(new Date(), 10).toISOString();
        const endDate = addDays(addHours(new Date(), 2), 10).toISOString()

        const response = await request(app)
                            .put(`/conferences/${conferenceId}/dates`)
                            .set('Authorization', E2eUsers.john.createJwtAuthorization())
                            .send({startDate, endDate})

        expect(response.status).toEqual(200);
        
        const conferenceRepository = testApp.containerDI.resolve('conferenceRepository');
        const updatedConference = await conferenceRepository.findById(conferenceId);

        expect(updatedConference).toBeDefined();
        expect(updatedConference?.props.startDate).toEqual(startDate);
        expect(updatedConference?.props.endDate).toEqual(endDate);

    })
})