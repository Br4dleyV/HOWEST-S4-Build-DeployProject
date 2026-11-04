import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { PayOrderInput } from '@/Application/Ticketing/Payments/mod.ts';
import { PayOrderController } from '@/Infrastructure/WebApi/Controllers/mod.ts';

function createMockRouterContext(params: Record<string, unknown>, bodyData: unknown) {
    return {
        params,
        request: {
            body: {
                json: async () => bodyData,
            },
        },
        response: { status: 0, headers: new Headers(), type: '', body: undefined },
    } as any;
}

Deno.test('[Unit] - PayOrderController - handle - valid payload - delegates and returns paymentId', async () => {
    let executedInput: PayOrderInput | undefined;

    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (input: PayOrderInput): Promise<string> => {
            executedInput = input;
            return 'payment-123';
        },
    };

    const controller = new PayOrderController(useCase);
    const ctx = createMockRouterContext(
        { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
        {
            externalId: 'provider-12345',
            paymentMethod: 'Credit Card',
            cardNumber: '4111111111111111',
            expiryDate: '12/2028',
            cvv: '123',
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            amount: 1100,
        },
    );

    await controller.handle(ctx);

    assertEquals(executedInput?.orderId, '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469');
    assertEquals(executedInput?.amount, 1100);
    assertEquals(ctx.response.status, 201);
    assertEquals(ctx.response.headers.get('Location'), '/api/orders/8fdd8b8e-8de4-4b9a-8e16-868b72f4f469/payments/payment-123');
    assertEquals(ctx.response.type, 'application/json');
    assertEquals((ctx.response.body as { paymentId: string }).paymentId, 'payment-123');
});

Deno.test('[Unit] - PayOrderController - handle - non-positive amount - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 0,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - request body not object - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                null,
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing externalId - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing paymentMethod - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing cardNumber - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing expiryDate - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing cvv - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing bookingId - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing amount - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - missing orderId - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: 1100,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - PayOrderController - handle - negative amount - rejects', async () => {
    const useCase: UseCase<PayOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new PayOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469' },
                {
                    externalId: 'provider-12345',
                    paymentMethod: 'Credit Card',
                    cardNumber: '4111111111111111',
                    expiryDate: '12/2028',
                    cvv: '123',
                    bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
                    amount: -1,
                },
            ),
        ),
        Error,
    );
});