import { Optional } from '@domaincrafters/std';
import { assertEquals, assertRejects } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import type {
    GetOrderByBookingIdQueryPort,
    OrderData,
} from '@/Application/Ports/Queries/mod.ts';
import { GetOrderByBookingIdQueryUseCase } from '@/Application/Ticketing/Orders/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - GetOrderByBookingIdQueryUseCase - execute - existing booking id - returns read model',
    async () => {
        const order: OrderData = {
            id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            status: 'open',
            price: 1100,
            agreeToTerms: false,
            customer: null,
            tickets: [],
        };

        let queriedBookingId = '';
        const queryPort: GetOrderByBookingIdQueryPort = {
            getOrderByBookingId: async (bookingId: string) => {
                queriedBookingId = bookingId;
                return Optional.of<OrderData>(order);
            },
        };

        const useCase = new GetOrderByBookingIdQueryUseCase(queryPort, mockLogger);

        const result = await useCase.execute({ bookingId: order.bookingId });

        assertEquals(queriedBookingId, order.bookingId);
        assertEquals(result, order);
    },
);

Deno.test(
    '[Unit] - GetOrderByBookingIdQueryUseCase - execute - missing booking id - throws NotFoundDomainException',
    async () => {
        const queryPort: GetOrderByBookingIdQueryPort = {
            getOrderByBookingId: async () => Optional.empty<OrderData>(),
        };

        const useCase = new GetOrderByBookingIdQueryUseCase(queryPort, mockLogger);

        await assertRejects(
            () => useCase.execute({ bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d' }),
            NotFoundDomainException,
        );
    },
);