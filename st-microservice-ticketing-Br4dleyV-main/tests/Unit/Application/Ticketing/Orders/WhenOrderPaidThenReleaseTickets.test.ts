import { assertRejects } from '@std/assert';
import { Optional } from '@domaincrafters/std';

import type { UseCase } from '@/Application/Ports/mod.ts';
import { ReleaseTickets, WhenOrderPaidThenReleaseTickets } from '@/Application/Ticketing/Orders/mod.ts';
import { OrderPaid } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - WhenOrderPaidThenReleaseTickets - handle - valid event - executes ReleaseTickets use case', async () => {
    let receivedOrderId = '';
    const mockServiceProvider: any = {
        getService: async (name: string) => {
            if (name === ReleaseTickets.name) {
                return Optional.of({
                    execute: async (input: { orderId: string }) => {
                        receivedOrderId = input.orderId;
                    },
                } as unknown as UseCase<{ orderId: string }, void>);
            }
            return Optional.empty();
        },
    };

    const policy = new WhenOrderPaidThenReleaseTickets(mockServiceProvider);
    const event = OrderPaid.create(
        'order-123',
        'booking-123',
    );

    await policy.handle(event);

    if (receivedOrderId !== 'order-123') {
        throw new Error(`Expected order id to be 'order-123' but got '${receivedOrderId}'`);
    }
});

Deno.test('[Unit] - WhenOrderPaidThenReleaseTickets - handle - use case throws - propagates error', async () => {
    const expectedError = new Error('Order not found');

    const mockServiceProvider: any = {
        getService: async (name: string) => {
            if (name === ReleaseTickets.name) {
                return Optional.of({
                    execute: async () => {
                        throw expectedError;
                    },
                } as unknown as UseCase<{ orderId: string }, void>);
            }
            return Optional.empty();
        },
    };

    const policy = new WhenOrderPaidThenReleaseTickets(mockServiceProvider);
    const event = OrderPaid.create('order-456', 'booking-456');

    await assertRejects(
        () => policy.handle(event),
        Error,
        'Order not found',
    );
});
