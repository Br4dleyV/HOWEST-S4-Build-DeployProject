import { type Collection, type Document, type Filter } from '@mongodb';
import { Optional } from '@domaincrafters/std';

import type {
    CustomerData,
    GetOrderByBookingIdQueryPort,
    OrderData,
    TicketData,
} from '@/Application/Ports/Queries/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

export class MongoDbGetOrderByBookingIdQuery implements GetOrderByBookingIdQueryPort {
    private readonly _collection: Collection<Document>;

    constructor(mongoDbClient: MongoDbClient) {
        this._collection = mongoDbClient.collection<Document>('orders');
    }

    async getOrderByBookingId(bookingId: string): Promise<Optional<OrderData>> {
        const filter: Filter<Document> = {
            bookingId,
        } as unknown as Filter<Document>;

        const document = await this._collection.findOne(filter);
        if (!document) {
            return Optional.empty<OrderData>();
        }

        return Optional.of<OrderData>(this.mapReadModel(document));
    }

    private mapReadModel(document: Document): OrderData {
        const source = this.asRecord(document);

        return {
            id: this.asString(source._id ?? source.id),
            bookingId: this.asString(source.bookingId),
            status: this.asString(source.status),
            price: this.asNumber(source.priceCents),
            agreeToTerms: this.asBoolean(source.agreeToTerms),
            customer: this.mapCustomer(source.customer),
            tickets: Array.isArray(source.tickets)
                ? source.tickets.map((ticket) => this.mapTicket(ticket))
                : [],
        };
    }

    private mapCustomer(value: unknown): CustomerData | null {
        if (value === null || typeof value !== 'object') {
            return null;
        }

        const source = value as Record<string, unknown>;
        return {
            salutation: this.asString(source.salutation),
            firstName: this.asString(source.firstName),
            lastName: this.asString(source.lastName),
            email: this.asString(source.email),
        };
    }

    private mapTicket(value: unknown): TicketData {
        const source = this.asRecord(value);
        const seat = this.asRecord(source.seat);
        const movieInfo = this.asRecord(source.movieInfo);

        return {
            ticketId: this.asString(source.ticketId ?? source._id ?? source.id),
            seatNumber: this.asNumber(seat.seatNumber),
            visitorType: this.asString(seat.visitorType),
            price: this.asNumber(source.priceCents),
            movieId: this.asString(movieInfo.movieId),
            room: this.asString(source.room),
            showtime: this.asString(source.showtime),
        };
    }

    private asRecord(value: unknown): Record<string, unknown> {
        return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
    }

    private asString(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
            return String(value);
        }

        if (value !== null && typeof value === 'object') {
            const candidate = value as { toString?: () => string };
            if (typeof candidate.toString === 'function') {
                const serialized = candidate.toString();
                return serialized === '[object Object]' ? '' : serialized;
            }
        }

        return '';
    }

    private asNumber(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private asBoolean(value: unknown): boolean {
        if (typeof value === 'boolean') {
            return value;
        }

        return false;
    }
}