import { createMockDomainEventBus } from '@/tests/Unit/Application/Shared/MockDomainEventBus.ts';
import { assertEquals, assertRejects } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import { AddCustomerToOrder } from '@/Application/Ticketing/Orders/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order } from '@/Domain/Ticketing/Orders/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import { createMockOrderRepository } from '@/tests/Unit/Application/Shared/Repositories/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - AddCustomerToOrder - execute - valid input - updates and saves order', async () => {
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

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({ repositories, eventBus });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    const orderId = await useCase.execute({
        orderId: order.id.value,
        salutation: 'Ms.',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        agreeToTerms: true,
    });

    assertEquals(orderId, order.id.value);
    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(orderRepository.saveCalled, true);
    assertEquals(orderRepository.savedOrders[0]?.customer?.firstName, 'Jane');
    assertEquals(orderRepository.savedOrders[0]?.agreeToTerms, true);
});

Deno.test('[Unit] - AddCustomerToOrder - execute - empty last name - rejects', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            salutation: 'Mr.',
            firstName: 'John',
            lastName: '',
            email: 'john@example.com',
            agreeToTerms: true,
        }),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrder - execute - Mx. salutation - handles correctly', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    const orderId = await useCase.execute({
        orderId: order.id.value,
        salutation: 'mx',
        firstName: 'Jordan',
        lastName: 'Taylor',
        email: 'jordan@example.com',
        agreeToTerms: true,
    });

    assertEquals(orderId, order.id.value);
    assertEquals(orderRepository.savedOrders[0]?.customer?.salutation, 'Mx.');
});
Deno.test('[Unit] - AddCustomerToOrder - execute - agreeToTerms false - rejects', async () => {
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

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            salutation: 'Ms.',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            agreeToTerms: false,
        }),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrder - execute - order not found - rejects', async () => {
    const orderRepository = createMockOrderRepository({ existingOrders: [] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: 'non-existent-order-id',
            salutation: 'Mr.',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            agreeToTerms: true,
        }),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrder - execute - with different salutations', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    const orderId = await useCase.execute({
        orderId: order.id.value,
        salutation: 'Mx.',
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex@example.com',
        agreeToTerms: true,
    });

    assertEquals(orderId, order.id.value);
    assertEquals(orderRepository.savedOrders[0]?.customer?.salutation, 'Mx.');
});

Deno.test('[Unit] - AddCustomerToOrder - execute - with Mr. salutation', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    const orderId = await useCase.execute({
        orderId: order.id.value,
        salutation: 'Mr.',
        firstName: 'Robert',
        lastName: 'Williams',
        email: 'robert@example.com',
        agreeToTerms: true,
    });

    assertEquals(orderId, order.id.value);
    assertEquals(orderRepository.savedOrders[0]?.customer?.salutation, 'Mr.');
});

Deno.test('[Unit] - AddCustomerToOrder - execute - verifies domain event is raised', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({ repositories, eventBus });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await useCase.execute({
        orderId: order.id.value,
        salutation: 'Ms.',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        agreeToTerms: true,
    });

    assertEquals(eventBus.publishedEvents.length > 0, true);
});

Deno.test('[Unit] - AddCustomerToOrder - execute - invalid email - rejects', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({ repositories, eventBus });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            salutation: 'Mr.',
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid-email',
            agreeToTerms: true,
        }),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrder - execute - empty first name - rejects', async () => {
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
        1,
        0,
        [12],
    );

    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);

    const unitOfWork = createMockUnitOfWork({ repositories });
    const useCase = new AddCustomerToOrder(unitOfWork, mockLogger);

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            salutation: 'Mr.',
            firstName: '',
            lastName: 'Doe',
            email: 'john@example.com',
            agreeToTerms: true,
        }),
        Error,
    );
});