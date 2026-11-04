import { assertEquals } from '@std/assert';

import { MongoDbGetOrderByBookingIdQuery } from '@/Infrastructure/Persistence/MongoDb/Queries/mod.ts';
import type { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

function createStubMongoDbClient(document: unknown | null) {
    const collection = {
        findOne: async (): Promise<unknown | null> => document,
    };

    return {
        collection: () => collection,
    } as unknown as MongoDbClient;
}

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - returns order read model', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: false,
        customer: null,
        tickets: [{
            ticketId: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf',
            movieInfo: { movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc' },
            seat: { seatNumber: 12, visitorType: 'standard' },
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            priceCents: 500,
        }],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.id, '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469');
    assertEquals(order.bookingId, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(order.price, 1100);
    assertEquals(order.tickets[0]?.movieId, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - missing order returns empty', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient(null));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, false);
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with customer info', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: true,
        customer: {
            salutation: 'Mr',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
        },
        tickets: [],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.customer?.firstName, 'John');
    assertEquals(order.customer?.lastName, 'Doe');
    assertEquals(order.customer?.email, 'john@example.com');
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with empty tickets array', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: false,
        customer: null,
        tickets: [],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.tickets.length, 0);
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - without tickets property', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: false,
        customer: null,
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.tickets.length, 0);
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with multiple tickets', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 2200,
        agreeToTerms: false,
        customer: null,
        tickets: [
            {
                ticketId: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf',
                movieInfo: { movieId: 'movie-1' },
                seat: { seatNumber: 12, visitorType: 'standard' },
                room: 'Room A',
                showtime: '2026-05-20T19:30:00.000Z',
                priceCents: 1100,
            },
            {
                _id: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0c0',
                movieInfo: { movieId: 'movie-2' },
                seat: { seatNumber: 13, visitorType: 'adult' },
                room: 'Room A',
                showtime: '2026-05-20T19:30:00.000Z',
                priceCents: 1100,
            },
        ],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.tickets.length, 2);
    assertEquals(order.tickets[0]?.ticketId, '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf');
    assertEquals(order.tickets[1]?.ticketId, '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0c0');
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with customer missing properties', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: false,
        customer: { firstName: 'John' },
        tickets: [],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.customer?.firstName, 'John');
    assertEquals(order.customer?.lastName, '');
    assertEquals(order.customer?.email, '');
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with numeric price values', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: '1100',
        agreeToTerms: 0,
        customer: null,
        tickets: [{
            ticketId: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf',
            movieInfo: { movieId: 'movie-1' },
            seat: { seatNumber: '12', visitorType: 'standard' },
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            priceCents: '500',
        }],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.price, 1100);
    assertEquals(order.tickets[0]?.seatNumber, 12);
    assertEquals(order.tickets[0]?.price, 500);
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with invalid numeric values defaults to 0', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        _id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: NaN,
        agreeToTerms: false,
        customer: null,
        tickets: [{
            ticketId: '23c1f2c4-ff67-4f8e-8d0b-8fdbe8efb0bf',
            movieInfo: { movieId: 'movie-1' },
            seat: { seatNumber: Infinity, visitorType: 'standard' },
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            priceCents: 'not-a-number',
        }],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.price, 0);
    assertEquals(order.tickets[0]?.seatNumber, 0);
    assertEquals(order.tickets[0]?.price, 0);
});

Deno.test('[Unit] - MongoDbGetOrderByBookingIdQuery - getOrderByBookingId - with id fallback from id property', async () => {
    const query = new MongoDbGetOrderByBookingIdQuery(createStubMongoDbClient({
        id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        status: 'open',
        priceCents: 1100,
        agreeToTerms: false,
        customer: null,
        tickets: [],
    }));

    const result = await query.getOrderByBookingId('32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');

    assertEquals(result.isPresent, true);
    const order = result.getOrThrow();
    assertEquals(order.id, '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469');
});