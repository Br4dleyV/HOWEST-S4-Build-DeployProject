import { assertEquals, assertRejects } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import { PayOrder } from '@/Application/Ticketing/Payments/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order } from '@/Domain/Ticketing/Orders/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { createMockOnlinePaymentService } from '@/tests/Unit/Application/Shared/Gateways/mod.ts';
import { createMockDomainEventBus } from '@/tests/Unit/Application/Shared/MockDomainEventBus.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import { createMockOrderRepository, createMockPaymentRepository } from '@/tests/Unit/Application/Shared/Repositories/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

function createPaymentOrder(): Order {
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
    return order;
}

function createPayOrderSetup(
    paymentServiceOptions: Parameters<typeof createMockOnlinePaymentService>[0] = {},
) {
    const order = createPaymentOrder();
    const orderRepository = createMockOrderRepository({ existingOrders: [order] });
    const paymentRepository = createMockPaymentRepository();
    const eventBus = createMockDomainEventBus();
    const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>([
        ['Order', orderRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
        ['Payment', paymentRepository as unknown as Repository<AggregateRoot<EntityId>, EntityId>],
    ]);
    const unitOfWork = createMockUnitOfWork({ repositories, eventBus });
    const paymentService = createMockOnlinePaymentService(paymentServiceOptions);
    const useCase = new PayOrder(unitOfWork, paymentService, mockLogger);

    return {
        order,
        orderRepository,
        paymentRepository,
        eventBus,
        unitOfWork,
        paymentService,
        useCase,
    };
}

Deno.test('[Unit] - PayOrder - execute - successful payment - saves twice and publishes success event', async () => {
    const { order, orderRepository, paymentRepository, eventBus, unitOfWork, paymentService, useCase } =
        createPayOrderSetup({
            defaultResponse: { success: true },
        });

    const paymentId = await useCase.execute({
        orderId: order.id.value,
        externalId: 'provider-12345',
        paymentMethod: 'Credit Card',
        cardNumber: '4111111111111111',
        expiryDate: '12/2028',
        cvv: '123',
        bookingId: order.bookingId.value,
        amount: 1100,
    });

    assertEquals(typeof paymentId, 'string');
    assertEquals(paymentService.payCalled, true);
    assertEquals(paymentService.receivedRequests[0]?.amount, 1100);
    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 2);
    assertEquals(paymentRepository.saveCallCount, 2);
    assertEquals(eventBus.publishCallCount, 1);
    assertEquals(eventBus.publishedEvents[0]?.FQDN.value, 'howestprime.ticketing.payment.paymentsuccess');
});

Deno.test('[Unit] - PayOrder - execute - failed payment - saves twice and publishes failure event', async () => {
    const { order, orderRepository, paymentRepository, eventBus, unitOfWork, paymentService, useCase } =
        createPayOrderSetup({
            defaultResponse: { success: false, failureReason: 'Payment declined by provider' },
        });

    const paymentId = await useCase.execute({
        orderId: order.id.value,
        externalId: 'provider-12345',
        paymentMethod: 'Credit Card',
        cardNumber: '4111111111111111',
        expiryDate: '12/2028',
        cvv: '123',
        bookingId: order.bookingId.value,
        amount: 1101,
    });

    assertEquals(typeof paymentId, 'string');
    assertEquals(paymentService.payCalled, true);
    assertEquals(paymentService.receivedRequests[0]?.amount, 1101);
    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 2);
    assertEquals(paymentRepository.saveCallCount, 2);
    assertEquals(eventBus.publishCallCount, 1);
    assertEquals(eventBus.publishedEvents[0]?.FQDN.value, 'howestprime.ticketing.payment.paymentfailed');
});

Deno.test('[Unit] - PayOrder - execute - invalid amount - rejects before saving', async () => {
    const { order, orderRepository, unitOfWork, paymentService, eventBus, useCase } = createPayOrderSetup();

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            externalId: 'provider-12345',
            paymentMethod: 'Credit Card',
            cardNumber: '4111111111111111',
            expiryDate: '12/2028',
            cvv: '123',
            bookingId: order.bookingId.value,
            amount: 0,
        }),
        Error,
    );

    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 0);
    assertEquals(paymentService.payCalled, false);
    assertEquals(eventBus.publishCallCount, 0);
});

Deno.test('[Unit] - PayOrder - execute - invalid cardNumber - rejects before saving', async () => {
    const { order, orderRepository, unitOfWork, useCase } = createPayOrderSetup();

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            externalId: 'provider-12345',
            paymentMethod: 'Credit Card',
            cardNumber: 'invalid',
            expiryDate: '12/2028',
            cvv: '123',
            bookingId: order.bookingId.value,
            amount: 1100,
        }),
        Error,
    );

    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 0);
});

Deno.test('[Unit] - PayOrder - execute - invalid expiryDate - rejects before saving', async () => {
    const { order, orderRepository, unitOfWork, useCase } = createPayOrderSetup();

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            externalId: 'provider-12345',
            paymentMethod: 'Credit Card',
            cardNumber: '4111111111111111',
            expiryDate: '13/2028',
            cvv: '123',
            bookingId: order.bookingId.value,
            amount: 1100,
        }),
        Error,
    );

    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 0);
});

Deno.test('[Unit] - PayOrder - execute - invalid cvv - rejects before saving', async () => {
    const { order, orderRepository, unitOfWork, useCase } = createPayOrderSetup();

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            externalId: 'provider-12345',
            paymentMethod: 'Credit Card',
            cardNumber: '4111111111111111',
            expiryDate: '12/2028',
            cvv: 'invalid',
            bookingId: order.bookingId.value,
            amount: 1100,
        }),
        Error,
    );

    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 0);
});

Deno.test('[Unit] - PayOrder - execute - invalid paymentMethod - rejects before saving', async () => {
    const { order, orderRepository, unitOfWork, useCase } = createPayOrderSetup();

    await assertRejects(
        () => useCase.execute({
            orderId: order.id.value,
            externalId: 'provider-12345',
            paymentMethod: 'InvalidMethod',
            cardNumber: '4111111111111111',
            expiryDate: '12/2028',
            cvv: '123',
            bookingId: order.bookingId.value,
            amount: 1100,
        }),
        Error,
    );

    assertEquals(orderRepository.byIdCalled, true);
    assertEquals(unitOfWork.saveCallCount, 0);
});

Deno.test('[Unit] - PayOrder - execute - invalid booking id in request - uses persisted order booking id', async () => {
    const { order, paymentRepository, eventBus, unitOfWork, paymentService, useCase } = createPayOrderSetup({
        defaultResponse: { success: true },
    });

    const paymentId = await useCase.execute({
        orderId: order.id.value,
        externalId: 'provider-12345',
        paymentMethod: 'Credit Card',
        cardNumber: '4111111111111111',
        expiryDate: '12/2028',
        cvv: '123',
        bookingId: 'not-a-uuid',
        amount: 1100,
    });

    assertEquals(typeof paymentId, 'string');
    assertEquals(paymentService.payCalled, true);
    assertEquals(paymentRepository.savedPayments[0]?.bookingId.value, order.bookingId.value);
    const publishedEvent = eventBus.publishedEvents[0] as unknown as { bookingId?: string } | undefined;
    assertEquals(publishedEvent?.bookingId, order.bookingId.value);
    assertEquals(unitOfWork.saveCallCount, 2);
});