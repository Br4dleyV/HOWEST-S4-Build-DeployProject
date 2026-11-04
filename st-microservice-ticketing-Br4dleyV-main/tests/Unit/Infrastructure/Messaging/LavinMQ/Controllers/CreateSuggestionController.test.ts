import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { CreateSuggestionUseCaseInput } from '@/Application/Ticketing/Suggestions/mod.ts';
import { CreateSuggestionController } from '@/Infrastructure/Messaging/LavinMQ/Controllers/mod.ts';

Deno.test('[Unit] - CreateSuggestionController - handle - valid payload - delegates to use case', async () => {
    let executedInput: CreateSuggestionUseCaseInput | undefined;

    const useCase: UseCase<CreateSuggestionUseCaseInput, string> = {
        execute: async (input: CreateSuggestionUseCaseInput): Promise<string> => {
            executedInput = input;
            return 'suggestion-id';
        },
    };

    const controller = new CreateSuggestionController(useCase);

    await controller.handle({
        email: 'user@example.com',
        title: 'Improve booking performance',
        description: 'Cache frequently requested movie data to reduce latency.',
    });

    assertEquals(executedInput?.email, 'user@example.com');
    assertEquals(executedInput?.title, 'Improve booking performance');
    assertEquals(executedInput?.description, 'Cache frequently requested movie data to reduce latency.');
});

Deno.test('[Unit] - CreateSuggestionController - handle - wrapped payload - rejects', async () => {
    const useCase: UseCase<CreateSuggestionUseCaseInput, string> = {
        execute: async (): Promise<string> => 'suggestion-id',
    };

    const controller = new CreateSuggestionController(useCase);

    await assertRejects(
        () => controller.handle({
            payload: {
                email: 'user@example.com',
                title: 'Improve booking performance',
                description: 'Cache frequently requested movie data to reduce latency.',
            },
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateSuggestionController - handle - invalid payload - rejects', async () => {
    const useCase: UseCase<CreateSuggestionUseCaseInput, string> = {
        execute: async (): Promise<string> => 'suggestion-id',
    };

    const controller = new CreateSuggestionController(useCase);

    await assertRejects(
        () => controller.handle(null as never),
        Error,
    );
});

Deno.test('[Unit] - CreateSuggestionController - handle - empty email - rejects', async () => {
    const useCase: UseCase<CreateSuggestionUseCaseInput, string> = {
        execute: async (): Promise<string> => 'suggestion-id',
    };

    const controller = new CreateSuggestionController(useCase);

    await assertRejects(
        () => controller.handle({
            email: ' ',
            title: 'Improve booking performance',
            description: 'Cache frequently requested movie data to reduce latency.',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateSuggestionController - handle - non-string title - rejects', async () => {
    const useCase: UseCase<CreateSuggestionUseCaseInput, string> = {
        execute: async (): Promise<string> => 'suggestion-id',
    };

    const controller = new CreateSuggestionController(useCase);

    await assertRejects(
        () => controller.handle({
            email: 'user@example.com',
            title: 123,
            description: 'Cache frequently requested movie data to reduce latency.',
        } as never),
        Error,
    );
});
