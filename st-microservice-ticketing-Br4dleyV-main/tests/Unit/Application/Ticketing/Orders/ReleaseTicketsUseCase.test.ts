import { assertEquals, assertRejects } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import { ReleaseTickets } from '@/Application/Ticketing/Orders/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order } from '@/Domain/Ticketing/Orders/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { createMockDomainEventBus } from '@/tests/Unit/Application/Shared/MockDomainEventBus.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import { createMockOrderRepository } from '@/tests/Unit/Application/Shared/Repositories/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - ReleaseTickets - execute - valid input - releases tickets and publishes event', async () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    order.acceptTerms();
    order.markAsPaid();
    order.pullDomainEvents();

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({ repositories, eventBus });
    const useCase = new ReleaseTickets(unitOfWork, mockLogger);

    await useCase.execute({
        orderId: order.id.value,
    });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(orderRepository.saveCalled, true);
    assertEquals(orderRepository.savedOrders[0]?.status.value, 'ticketReleased');
    assertEquals(eventBus.publishCallCount, 1);
    assertEquals(eventBus.publishedEvents[0]?.constructor.name, 'TicketsReleased');
});

Deno.test('[Unit] - ReleaseTickets - execute - order not found - rejects', async () => {
    const orderRepository = createMockOrderRepository({ existingOrders: [] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new ReleaseTickets(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: 'nonexistent-order-id',
        }),
        Error,
    );
});

Deno.test('[Unit] - ReleaseTickets - execute - order not paid - rejects', async () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    order.acceptTerms();
    order.pullDomainEvents();

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new ReleaseTickets(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
        }),
        Error,
    );
});
