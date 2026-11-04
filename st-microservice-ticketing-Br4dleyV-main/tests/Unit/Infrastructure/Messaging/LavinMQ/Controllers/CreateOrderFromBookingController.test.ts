import { assertEquals, assertRejects } from '@std/assert';

import type { UseCase } from '@/Application/Ports/mod.ts';
import type { CreateOrderFromBookingInput } from '@/Application/Ticketing/Orders/mod.ts';
import {
    CreateOrderFromBookingController,
} from '@/Infrastructure/Messaging/LavinMQ/Controllers/mod.ts';

Deno.test('[Unit] - CreateOrderFromBookingController - handle - valid payload - delegates to use case', async () => {
    let executedInput: CreateOrderFromBookingInput | undefined;

    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (input: CreateOrderFromBookingInput): Promise<string> => {
            executedInput = input;
            return 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963';
        },
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await controller.handle({
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        room: 'Room A',
        showtime: '2026-05-20T19:30:00.000Z',
        standardVisitors: 2,
        discountedVisitors: 1,
        seatNumbers: [12, 13, 14],
    } as never);

    assertEquals(executedInput?.bookingId, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(executedInput?.movieId, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(executedInput?.showtime.toISOString(), '2026-05-20T19:30:00.000Z');
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - invalid seat count - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - null payload - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle(null as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-object payload - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle('not-object' as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - empty bookingId - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '   ',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-string movieId - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 123,
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - negative standardVisitors - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: -1,
            discountedVisitors: 1,
            seatNumbers: [12, 13],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - float standardVisitors - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2.5,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - negative discountedVisitors - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: -1,
            seatNumbers: [12, 13],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-array seatNumbers - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: 'not-array',
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - zero seat number - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [0, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - invalid showtime date - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: 'not-a-date',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - empty room - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: '',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - wrapped payload - extracts correctly', async () => {
    let executedInput: CreateOrderFromBookingInput | undefined;

    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (input: CreateOrderFromBookingInput): Promise<string> => {
            executedInput = input;
            return 'e4ff4c6a-b11a-4ef1-9f31-13c672a8f963';
        },
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await controller.handle({
        payload: {
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        },
    } as never);

    assertEquals(executedInput?.bookingId, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-string showtime - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: 12345,
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-string room - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 123,
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - non-integer seat number - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12.5, 13, 14],
        } as never),
        Error,
    );
});

Deno.test('[Unit] - CreateOrderFromBookingController - handle - negative seat number - rejects', async () => {
    const useCase: UseCase<CreateOrderFromBookingInput, string> = {
        execute: async (): Promise<string> => 'ignored',
    };

    const controller = new CreateOrderFromBookingController(useCase);

    await assertRejects(
        () => controller.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [-1, 13, 14],
        } as never),
        Error,
    );
});
