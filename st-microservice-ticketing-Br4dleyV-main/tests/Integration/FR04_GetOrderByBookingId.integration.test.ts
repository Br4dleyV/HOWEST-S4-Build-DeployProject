import { assertEquals } from '@std/assert';
import { MongoClient } from '@mongodb';

import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

const shouldRunIntegration = Deno.env.get('RUN_FR04_INTEGRATION_TESTS') === '1';

Deno.test({
    name: '[Integration] - FR04 - GET /api/orders/{bookingId} returns the order details from MongoDB',
    ignore: !shouldRunIntegration,
    sanitizeResources: false,
    sanitizeOps: false,
    async fn() {
        const dbName = 'howestprime-ticketing-fr04-it';
        const connectionString = MongoDbClient.createConnectionString(
            'mongodb',
            'localhost',
            '40131',
            'authSource=admin&directConnection=true',
            dbName,
            '',
            '',
        );

        const client = new MongoClient(connectionString, {
            directConnection: true,
        });
        await client.connect();

        const mongoDbClient = new MongoDbClient(client);
        const orders = mongoDbClient.collection('orders');

        const bookingId = '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d';
        const orderId = '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469';

        await orders.deleteMany({ bookingId });
        await orders.insertOne({
            _id: orderId,
            bookingId,
            status: 'open',
            priceCents: 1100,
            agreeToTerms: false,
            customer: null,
            tickets: [
                {
                    ticketId: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf',
                    movieInfo: {
                        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
                        title: 'Example Movie',
                        durationMinutes: 120,
                        genres: ['Drama'],
                        posterUrl: 'https://example.com/poster.png',
                        ageRating: '12+',
                        priceCents: 500,
                    },
                    seat: { seatNumber: 12, visitorType: 'standard' },
                    room: 'Room A',
                    showtime: '2026-05-20T19:30:00.000Z',
                    priceCents: 500,
                },
                {
                    ticketId: 'c1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
                    movieInfo: {
                        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
                        title: 'Example Movie',
                        durationMinutes: 120,
                        genres: ['Drama'],
                        posterUrl: 'https://example.com/poster.png',
                        ageRating: '12+',
                        priceCents: 500,
                    },
                    seat: { seatNumber: 13, visitorType: 'standard' },
                    room: 'Room A',
                    showtime: '2026-05-20T19:30:00.000Z',
                    priceCents: 500,
                },
                {
                    ticketId: 'd1d2d3d4-e5e6-4f70-8091-0a1b2c3d4e5f',
                    movieInfo: {
                        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
                        title: 'Example Movie',
                        durationMinutes: 120,
                        genres: ['Drama'],
                        posterUrl: 'https://example.com/poster.png',
                        ageRating: '12+',
                        priceCents: 500,
                    },
                    seat: { seatNumber: 14, visitorType: 'discounted' },
                    room: 'Room A',
                    showtime: '2026-05-20T19:30:00.000Z',
                    priceCents: 450,
                },
            ],
        } as never);

        try {
            const validResponse = await fetch(`http://localhost:8000/api/orders/${bookingId}`, {
                headers: { Accept: 'application/json' },
            });
            assertEquals(validResponse.status, 200);

            const validBody = await validResponse.json();
            assertEquals(typeof validBody.id, 'string');
            assertEquals(validBody.id.length > 0, true);
            assertEquals(validBody.bookingId, bookingId);
            assertEquals(typeof validBody.price, 'number');
            assertEquals(validBody.price > 0, true);
            assertEquals(typeof validBody.agreeToTerms, 'boolean');
            assertEquals(Array.isArray(validBody.tickets), true);
            assertEquals(validBody.tickets.length > 0, true);
            assertEquals(validBody.customer === null || typeof validBody.customer === 'object', true);

            const invalidResponse = await fetch('http://localhost:8000/api/orders/not-a-uuid', {
                headers: { Accept: 'application/json' },
            });
            assertEquals(invalidResponse.status, 400);

            const missingResponse = await fetch(
                'http://localhost:8000/api/orders/11111111-1111-4111-8111-111111111111',
                {
                    headers: { Accept: 'application/json' },
                },
            );
            assertEquals(missingResponse.status, 404);
        } finally {
            await orders.deleteMany({ bookingId });
            await client.close();
        }
    },
});