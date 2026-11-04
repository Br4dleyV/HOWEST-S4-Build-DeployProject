import { assertEquals, assertRejects } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import {
    CreateOrderFromBooking,
} from '@/Application/Ticketing/Orders/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import {
    createMockMovieRepository,
    createMockOrderRepository,
} from '@/tests/Unit/Application/Shared/Repositories/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - CreateOrderFromBooking - execute - valid input - creates and saves order', async () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const movieRepository = createMockMovieRepository({
        existingMovies: [movie],
    });
    const orderRepository = createMockOrderRepository();
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Movie', movieRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({
        repositories,
    });

    const useCase = new CreateOrderFromBooking(unitOfWork, mockLogger);

    const orderId = await useCase.execute({
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        room: 'Room A',
        showtime: new Date('2026-05-20T19:30:00.000Z'),
        standardVisitors: 2,
        discountedVisitors: 1,
        seatNumbers: [12, 13, 14],
    });

    assertEquals(typeof orderId, 'string');
    assertEquals(orderId.length > 0, true);
    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(orderRepository.saveCalled, true);
    assertEquals(orderRepository.saveCallCount, 1);
    assertEquals(orderRepository.savedOrders[0]?.bookingId.value, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(orderRepository.savedOrders[0]?.customer, null);
});

Deno.test('[Unit] - CreateOrderFromBooking - execute - missing movie - rejects', async () => {
    const movieRepository = createMockMovieRepository();
    const orderRepository = createMockOrderRepository();
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Movie', movieRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({
        repositories,
    });

    const useCase = new CreateOrderFromBooking(unitOfWork, mockLogger);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(null, { status: 404 }) as never;

    try {
        await assertRejects(
            () => useCase.execute({
                bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
                room: 'Room A',
                showtime: new Date('2026-05-20T19:30:00.000Z'),
                standardVisitors: 2,
                discountedVisitors: 1,
                seatNumbers: [12, 13, 14],
            }),
            Error,
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

Deno.test('[Unit] - CreateOrderFromBooking - execute - missing local movie - hydrates from movies api and saves order', async () => {
    const movieRepository = createMockMovieRepository();
    const orderRepository = createMockOrderRepository();
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Movie', movieRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({
        repositories,
    });

    const useCase = new CreateOrderFromBooking(unitOfWork, mockLogger);
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input: RequestInfo | URL) => {
        const url = String(input);
        if (!url.endsWith('/api/movie-catalog/b3f9a2d3-6f1c-4e0a-9a1d-123456789abc')) {
            throw new Error(`Unexpected fetch url: ${url}`);
        }

        return new Response(JSON.stringify({
            id: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            duration: 120,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        }) as never;
    };

    try {
        const orderId = await useCase.execute({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: new Date('2026-05-20T19:30:00.000Z'),
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        });

        assertEquals(typeof orderId, 'string');
        assertEquals(movieRepository.saveCalled, true);
        assertEquals(orderRepository.saveCalled, true);
        assertEquals(orderRepository.savedOrders[0]?.bookingId.value, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    } finally {
        globalThis.fetch = originalFetch;
    }
});
