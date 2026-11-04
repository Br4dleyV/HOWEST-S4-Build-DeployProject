import { assertEquals, assertRejects } from '@std/assert';
import { Optional } from '@domaincrafters/std';

import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Payments/mod.ts';
import { MarkOrderAsPaid, type MarkOrderAsPaidInput } from '@/Application/Ticketing/Orders/mod.ts';
import { PaymentSucceeded } from '@/Domain/Ticketing/Payments/Events/PaymentSucceeded.ts';
import { createMockDomainEventBus } from '@/tests/Unit/Application/Shared/MockDomainEventBus.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import { createMockOrderRepository } from '@/tests/Unit/Application/Shared/Repositories/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order } from '@/Domain/Ticketing/Orders/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - valid event - executes MarkOrderAsPaid use case',
    async () => {
        // Arrange
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

        // Accept terms (prerequisite for marking as paid)
        order.acceptTerms();

        const orderRepository = createMockOrderRepository({ existingOrders: [order] });
        const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
            ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
        ]);

        const eventBus = createMockDomainEventBus();
        const unitOfWork = createMockUnitOfWork({ repositories, eventBus });

        const markOrderAsPaidUseCase = new MarkOrderAsPaid(unitOfWork, mockLogger);

        const mockServiceProvider: any = {
            getService: async (name: string) => {
                if (name === MarkOrderAsPaid.name) {
                    return Optional.of(markOrderAsPaidUseCase);
                }
                return Optional.empty();
            },
        };

        const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(mockServiceProvider);
        const event = PaymentSucceeded.create(
            'payment-123',
            order.id.value,
            order.bookingId.value,
        );

        // Act
        await policy.handle(event);

        // Assert
        assertEquals(unitOfWork.saveCalled, true);
        assertEquals(orderRepository.savedOrders[0]?.status.value, 'paid');
    },
);

Deno.test(
    '[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - use case throws - propagates error',
    async () => {
        // Arrange
        const expectedError = new Error('Order not found');

        const mockUseCase = {
            execute: async () => {
                throw expectedError;
            },
        } as unknown as UseCase<MarkOrderAsPaidInput, void>;

        const mockServiceProvider: any = {
            getService: async (name: string) => {
                if (name === MarkOrderAsPaid.name) {
                    return Optional.of(mockUseCase);
                }
                return Optional.empty();
            },
        };

        const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(mockServiceProvider);
        const event = PaymentSucceeded.create(
            'payment-456',
            'order-456',
            'booking-456',
        );

        // Act & Assert
        await assertRejects(
            () => policy.handle(event),
            Error,
            'Order not found',
        );
    },
);

