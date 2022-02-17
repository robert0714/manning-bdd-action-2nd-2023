import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {AppModule} from "./app.module";
import {AccountStatus} from "./frequent-flyer/entities/accountStatus";

describe('Frequent Flyer Registration', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    const aFrequentFlyerWithMissingInfo = {
        email: 'ace@dr.com',
        password: 'secret',
        firstName: 'Ace',
        lastName: '',
        title: 'Ms',
        address: 'London',
        country: 'UK'
    }

    const aFrequentFlyer = function() {
        return {
            email: 'flyer' + Math.random() + '@example.org',
            password: 'secret',
            firstName: 'Rose',
            lastName: 'Tyler',
            title: 'Ms',
            address: 'London',
            country: 'UK'
        }

    }

    describe("When registering a new frequent flyer", () => {

        it(`should create a new pending frequent flyer account`, async () => {
            const response = await request(app.getHttpServer())
                .post('/api/frequent-flyer')
                .send(aFrequentFlyer())
                .expect(201);

            expect(response.body.accountStatus).toEqual(AccountStatus.Pending);
        });

        it(`should return an error if mandatory fields are missing`, async () => {
            await request(app.getHttpServer())
                .post('/api/frequent-flyer')
                .send(aFrequentFlyerWithMissingInfo)
                .expect(400);
        });

        it(`should create a new email token for each new account`, async () => {
            // GIVEN
            const response = await request(app.getHttpServer())
                .post('/api/frequent-flyer')
                .send(aFrequentFlyer())
                .expect(201);
            const frequentFlyerNumber = response.body.frequentFlyerNumber;

            // WHEN
            const token = await request(app.getHttpServer())
                .get(`/api/tokens/frequent-flyer/${frequentFlyerNumber}`)
                .expect(200);

            // THEN
            expect(token).toBeDefined()
        });

        it(`should be able to activate a new account using the token`, async () => {
            // GIVEN
            const flyer = aFrequentFlyer();
            const response = await request(app.getHttpServer())
                .post('/api/frequent-flyer')
                .send(flyer)
                .expect(201);
            const frequentFlyerNumber = response.body.frequentFlyerNumber;
            const tokenResponse = await request(app.getHttpServer())
                .get(`/api/tokens/frequent-flyer/${frequentFlyerNumber}`)
                .expect(200);

            const token = tokenResponse.text

            // WHEN
            await request(app.getHttpServer())
                .post("/api/frequent-flyer/email-confirmation")
                .send({frequentFlyerNumber: frequentFlyerNumber, email: flyer.email, token: token })
                .expect(201);

            // THEN
            const loadedFlyerResponse = await request(app.getHttpServer())
                .get(`/api/frequent-flyer/${frequentFlyerNumber}`)
                .expect(200);

            const loadedFlyer = loadedFlyerResponse.body;
            expect(loadedFlyer.accountStatus).toEqual(AccountStatus.Active)
        });

    })

    afterAll(async () => {
        await app.close();
    });
});