import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    CreateOrderFromBookingInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import type { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface CreateOrderFromBookingRequest {
    bookingId: string;
    movieId: string;
    room: string;
    showtime: string;
    standardVisitors: number;
    discountedVisitors: number;
    seatNumbers: number[];
}

export class CreateOrderFromBookingController implements AmqpController<CreateOrderFromBookingRequest> {
    private readonly _useCase: UseCase<CreateOrderFromBookingInput, string>;

    constructor(useCase: UseCase<CreateOrderFromBookingInput, string>) {
        this._useCase = useCase;
    }

    async handle(request: CreateOrderFromBookingRequest): Promise<void> {
        const input = this.extractInput(request);
        await this._useCase.execute(input);
    }

    private extractInput(request: CreateOrderFromBookingRequest): CreateOrderFromBookingInput {
        if (request === null || typeof request !== 'object') {
            throw new IllegalArgumentException('BookingOpened payload must be a JSON object.');
        }

        const payload = Object.hasOwn(request, 'payload')
            ? (request as unknown as { payload: CreateOrderFromBookingRequest }).payload
            : request;

        const standardVisitors = this.requireNonNegativeInteger(
            payload.standardVisitors,
            'standardVisitors',
        );
        const discountedVisitors = this.requireNonNegativeInteger(
            payload.discountedVisitors,
            'discountedVisitors',
        );
        const seatNumbers = this.requireSeatNumbers(payload.seatNumbers);

        if (seatNumbers.length !== standardVisitors + discountedVisitors) {
            throw new IllegalArgumentException(
                'seatNumbers length must match standardVisitors + discountedVisitors.',
            );
        }

        return {
            bookingId: this.requireNonEmptyString(payload.bookingId, 'bookingId'),
            movieId: this.requireNonEmptyString(payload.movieId, 'movieId'),
            room: this.requireNonEmptyString(payload.room, 'room'),
            showtime: this.requireDate(payload.showtime, 'showtime'),
            standardVisitors,
            discountedVisitors,
            seatNumbers,
        };
    }

    private requireNonEmptyString(value: unknown, fieldName: string): string {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a string.`);
        }

        if (value.trim().length === 0) {
            throw new IllegalArgumentException(`Field '${fieldName}' must not be empty.`);
        }

        return value;
    }

    private requireNonNegativeInteger(value: unknown, fieldName: string): number {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new IllegalArgumentException(
                `Field '${fieldName}' must be a non-negative integer.`,
            );
        }

        return value;
    }

    private requireSeatNumbers(value: unknown): number[] {
        if (!Array.isArray(value)) {
            throw new IllegalArgumentException('Field \"seatNumbers\" must be an array.');
        }

        if (value.some((seat) => typeof seat !== 'number' || !Number.isInteger(seat) || seat <= 0)) {
            throw new IllegalArgumentException(
                'Field \"seatNumbers\" must contain only positive integers.',
            );
        }

        return value;
    }

    private requireDate(value: unknown, fieldName: string): Date {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a string.`);
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a valid date-time.`);
        }

        return date;
    }
}
