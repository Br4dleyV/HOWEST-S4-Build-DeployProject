import { Entity, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { Money } from '@/Domain/Ticketing/Movies/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { MovieInfo } from './ValueObjects/MovieInfo.ts';
import { Seat } from './ValueObjects/Seat.ts';

export class TicketId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): TicketId {
        return new TicketId(value);
    }
}

export class Ticket extends Entity<TicketId> {
    private readonly _movieInfo: MovieInfo;
    private readonly _seat: Seat;
    private readonly _room: string;
    private readonly _showtime: Date;
    private readonly _price: Money;

    private constructor(
        id: TicketId,
        movieInfo: MovieInfo,
        seat: Seat,
        room: string,
        showtime: Date,
        price: Money,
    ) {
        super(id);
        this._movieInfo = movieInfo;
        this._seat = seat;
        this._room = room;
        this._showtime = showtime;
        this._price = price;
    }

    static create(
        movieInfo: MovieInfo,
        seat: Seat,
        room: string,
        showtime: Date,
        priceCents: number,
        ticketId?: string,
    ): Ticket {
        const normalizedRoom = room.trim();
        if (normalizedRoom.length === 0) {
            throw new IllegalArgumentException('Room must not be empty.');
        }

        if (!(showtime instanceof Date) || Number.isNaN(showtime.getTime())) {
            throw new IllegalArgumentException('Showtime must be a valid date.');
        }

        return new Ticket(
            TicketId.create(ticketId),
            movieInfo,
            seat,
            normalizedRoom,
            new Date(showtime),
            Money.createCents(priceCents),
        );
    }

    override get id(): TicketId {
        return super.id as TicketId;
    }

    get movieInfo(): MovieInfo {
        return this._movieInfo;
    }

    get seat(): Seat {
        return this._seat;
    }

    get room(): string {
        return this._room;
    }

    get showtime(): Date {
        return new Date(this._showtime);
    }

    get price(): Money {
        return this._price;
    }
}
