import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { OrderData } from '@/Application/Ports/Queries/mod.ts';
import type {
    GetOrderByBookingIdQueryUseCaseInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import { GetOrderByBookingIdController } from '@/Infrastructure/WebApi/Controllers/mod.ts';

function createMockRouterContext(params: Record<string, unknown>) {
    return {
        params,
        response: { status: 0, headers: new Headers(), type: '', body: undefined },
    } as any;
}

Deno.test('[Unit] - GetOrderByBookingIdController - handle - valid booking id - delegates to use case', async () => {
    let executedInput: GetOrderByBookingIdQueryUseCaseInput | undefined;

    const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> = {
        execute: async (input: GetOrderByBookingIdQueryUseCaseInput): Promise<OrderData> => {
            executedInput = input;
            return {
                id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
                bookingId: input.bookingId,
                status: 'open',
                price: 0,
                agreeToTerms: false,
                customer: null,
                tickets: [],
            };
        },
    };

    const controller = new GetOrderByBookingIdController(useCase);

    await controller.handle(
        createMockRouterContext({ bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d' }),
    );

    assertEquals(executedInput?.bookingId, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
});

Deno.test('[Unit] - GetOrderByBookingIdController - handle - valid booking id - sets 200 status', async () => {
    const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> = {
        execute: async (input: GetOrderByBookingIdQueryUseCaseInput): Promise<OrderData> => ({
            id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
            bookingId: input.bookingId,
            status: 'open',
            price: 0,
            agreeToTerms: false,
            customer: null,
            tickets: [],
        }),
    };

    const controller = new GetOrderByBookingIdController(useCase);
    const ctx = createMockRouterContext({ bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d' });

    await controller.handle(ctx);

    assertEquals(ctx.response.status, 200);
});

Deno.test('[Unit] - GetOrderByBookingIdController - handle - non-empty booking id - delegates to use case', async () => {
    let executedInput: GetOrderByBookingIdQueryUseCaseInput | undefined;

    const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> = {
        execute: async (input: GetOrderByBookingIdQueryUseCaseInput): Promise<OrderData> => {
            executedInput = input;
            return {
                id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
                bookingId: input.bookingId,
                status: 'open',
                price: 0,
                agreeToTerms: false,
                customer: null,
                tickets: [],
            };
        },
    };

    const controller = new GetOrderByBookingIdController(useCase);

    await controller.handle(createMockRouterContext({ bookingId: 'not-a-uuid' }));

    assertEquals(executedInput?.bookingId, 'not-a-uuid');
});

Deno.test('[Unit] - GetOrderByBookingIdController - handle - valid booking id - sets 200 status', async () => {
    const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> = {
        execute: async (_input: GetOrderByBookingIdQueryUseCaseInput): Promise<OrderData> => ({
            id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
            bookingId: 'ignored',
            status: 'open',
            price: 0,
            agreeToTerms: false,
            customer: null,
            tickets: [],
        }),
    };

    const controller = new GetOrderByBookingIdController(useCase);
    const ctx = createMockRouterContext({ bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d' });

    await controller.handle(ctx);

    assertEquals(ctx.response.status, 200);
});

Deno.test('[Unit] - GetOrderByBookingIdController - handle - non-string booking id - rejects', async () => {
    const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> = {
        execute: async (): Promise<OrderData> => ({
            id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
            bookingId: 'ignored',
            status: 'open',
            price: 0,
            agreeToTerms: false,
            customer: null,
            tickets: [],
        }),
    };

    const controller = new GetOrderByBookingIdController(useCase);

    await assertRejects(
        () => controller.handle(createMockRouterContext({ bookingId: 12345 })),
        Error,
    );
});