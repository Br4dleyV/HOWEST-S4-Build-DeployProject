import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { SaveMovieInput } from '@/Application/Ticketing/Movies/mod.ts';
import { SaveMovieController } from '@/Infrastructure/Messaging/LavinMQ/Controllers/mod.ts';

Deno.test('[Unit] - SaveMovieController - handle - valid payload - delegates to use case', async () => {
    let executedInput: SaveMovieInput | undefined;

    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (input: SaveMovieInput): Promise<void> => {
            executedInput = input;
        },
    };

    const controller = new SaveMovieController(useCase);

    await controller.handle({
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama', 'Thriller'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
    } as never);

    assertEquals(executedInput?.movieId, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(executedInput?.title, 'Example Movie');
    assertEquals(executedInput?.durationMinutes, 120);
    assertEquals(executedInput?.genres, ['Drama', 'Thriller']);
});

Deno.test('[Unit] - SaveMovieController - handle - invalid payload - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 0,
            genres: ['Drama', 'Thriller'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - null payload - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle(null as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - wrapped payload - accepts payload field', async () => {
    let executedInput: SaveMovieInput | undefined;

    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (input: SaveMovieInput): Promise<void> => {
            executedInput = input;
        },
    };

    const controller = new SaveMovieController(useCase);

    await controller.handle({
        payload: {
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Wrapped Example Movie',
            durationMinutes: 90,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        },
    } as never);

    assertEquals(executedInput?.title, 'Wrapped Example Movie');
    assertEquals(executedInput?.durationMinutes, 90);
});

Deno.test('[Unit] - SaveMovieController - handle - empty title - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: ' ',
            durationMinutes: 90,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - non-number duration - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: '90',
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - infinite duration - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: Infinity,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - wrapped payload with wrapped posterUrl - accepts', async () => {
    let executedInput: SaveMovieInput | undefined;

    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (input: SaveMovieInput): Promise<void> => {
            executedInput = input;
        },
    };

    const controller = new SaveMovieController(useCase);

    await controller.handle({
        payload: {
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Wrapped Movie',
            durationMinutes: 100,
            genres: ['Action'],
            posterUrl: 'https://wrapped.example.com/poster.png',
            ageRating: '15+',
        },
    } as never);

    assertEquals(executedInput?.movieId, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(executedInput?.posterUrl, 'https://wrapped.example.com/poster.png');
    assertEquals(executedInput?.ageRating, '15+');
});

Deno.test('[Unit] - SaveMovieController - handle - non-finite duration - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: NaN,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - empty ageRating - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 90,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '  ',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - empty posterUrl - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 90,
            genres: ['Drama'],
            posterUrl: '   ',
            ageRating: '12+',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - SaveMovieController - handle - non-string movieId - rejects', async () => {
    const useCase: UseCase<SaveMovieInput, void> = {
        execute: async (): Promise<void> => {},
    };

    const controller = new SaveMovieController(useCase);

    await assertRejects(
        () => controller.handle({
            movieId: 123,
            title: 'Example Movie',
            durationMinutes: 90,
            genres: ['Drama'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never),
        Error,
    );
});
