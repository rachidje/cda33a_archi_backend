import { Application } from 'express';
import request from 'supertest';
import { E2eConferences } from '../seeds/e2e-conferences';
import { E2eUsers } from '../seeds/e2e-users';
import { TestApp } from '../test-app';


describe("Feature: Book a Seat",  () => {
    let testApp: TestApp;
    let app: Application

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        app = testApp.expressApp

        await testApp.loadFixtures([
            E2eUsers.john,
            E2eUsers.bob,
            E2eConferences.conference1
        ])
    })

    afterAll(async () => {
        await testApp.teardown()
    })

    describe('Scenario: Happy path', () => {
        // Attention c'est Bob qui est connecter pour s'inscrire a la conference de John
        const id = E2eConferences.conference1.entity.props.id

        it('should book a conference', async () => {
            const response = await request(app)
                                .post(`/conference/${id}/book`)
                                .set('Authorization', E2eUsers.bob.createJwtAuthorization())
            
            expect(response.status).toBe(201)

            const bookingRepository = testApp.containerDI.resolve('bookingRepository')
            const createdBooking = await bookingRepository.findOne(
                E2eUsers.bob.entity.props.id,
                id
            )

            expect(createdBooking).not.toBeNull()
            expect(createdBooking!.props).toEqual({
                id: expect.any(String),
                userId: E2eUsers.bob.entity.props.id,
                conferenceId: E2eConferences.conference1.entity.props.id
            })
        })
    })
})