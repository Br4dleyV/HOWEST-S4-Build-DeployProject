import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { AddCustomerToOrderInput } from '@/Application/Ticketing/Orders/mod.ts';
import { AddCustomerToOrderController } from '@/Infrastructure/WebApi/Controllers/mod.ts';

// Helper to create a mock RouterContext
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

Deno.test('[Unit] - AddCustomerToOrderController - handle - valid payload - delegates to use case', async () => {
    let executedInput: AddCustomerToOrderInput | undefined;

    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (input: AddCustomerToOrderInput): Promise<string> => {
            executedInput = input;
            return input.orderId;
        },
    };

    const controller = new AddCustomerToOrderController(useCase);

    await controller.handle(
        createMockRouterContext(
            { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
            {
                salutation: 'Ms.',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                agreeToTerms: true,
            },
        ),
    );

    assertEquals(executedInput?.orderId, 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963');
    assertEquals(executedInput?.agreeToTerms, true);
    assertEquals(executedInput?.firstName, 'Jane');
    assertEquals(executedInput?.lastName, 'Doe');
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - valid payload - sets 201 status', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (input: AddCustomerToOrderInput): Promise<string> => input.orderId,
    };

    const controller = new AddCustomerToOrderController(useCase);
    const ctx = createMockRouterContext(
        { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
        {
            salutation: 'Ms.',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            agreeToTerms: true,
        },
    );

    await controller.handle(ctx);

    assertEquals(ctx.response.status, 201);
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - non-boolean agreeToTerms - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane.doe@example.com',
                    agreeToTerms: 'true',
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - agreeToTerms false - delegates but use case may reject', async () => {
    let executedInput: AddCustomerToOrderInput | undefined;

    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (input: AddCustomerToOrderInput): Promise<string> => {
            executedInput = input;
            throw new Error('agreeToTerms must be true');
        },
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Mr.',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    agreeToTerms: false,
                },
            ),
        ),
        Error,
    );

    assertEquals(executedInput?.agreeToTerms, false);
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - missing salutation field - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - missing firstName field - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - missing lastName field - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    firstName: 'Jane',
                    email: 'jane@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - missing email field - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - missing agreeToTerms field - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - non-string salutation - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 123,
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - non-string firstName - rejects', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963' },
                {
                    salutation: 'Ms.',
                    firstName: 123,
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
    );
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - with Mr. salutation', async () => {
    let executedInput: AddCustomerToOrderInput | undefined;

    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (input: AddCustomerToOrderInput): Promise<string> => {
            executedInput = input;
            return input.orderId;
        },
    };

    const controller = new AddCustomerToOrderController(useCase);

    await controller.handle(
        createMockRouterContext(
            { orderId: 'order-123' },
            {
                salutation: 'Mr.',
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                agreeToTerms: true,
            },
        ),
    );

    assertEquals(executedInput?.salutation, 'Mr.');
    assertEquals(executedInput?.firstName, 'John');
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - with Mx. salutation', async () => {
    let executedInput: AddCustomerToOrderInput | undefined;

    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (input: AddCustomerToOrderInput): Promise<string> => {
            executedInput = input;
            return input.orderId;
        },
    };

    const controller = new AddCustomerToOrderController(useCase);

    await controller.handle(
        createMockRouterContext(
            { orderId: 'order-456' },
            {
                salutation: 'Mx.',
                firstName: 'Alex',
                lastName: 'Johnson',
                email: 'alex@example.com',
                agreeToTerms: true,
            },
        ),
    );

    assertEquals(executedInput?.salutation, 'Mx.');
});

Deno.test('[Unit] - AddCustomerToOrderController - handle - use case exception propagates', async () => {
    const useCase: UseCase<AddCustomerToOrderInput, string> = {
        execute: async (): Promise<string> => {
            throw new Error('Order not found');
        },
    };

    const controller = new AddCustomerToOrderController(useCase);

    await assertRejects(
        () => controller.handle(
            createMockRouterContext(
                { orderId: 'non-existent' },
                {
                    salutation: 'Mr.',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    agreeToTerms: true,
                },
            ),
        ),
        Error,
        'Order not found',
    );
});