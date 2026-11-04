import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { Customer } from '../ValueObjects/Customer.ts';
import { OrderDomainEvent } from './OrderDomainEvent.ts';

type ReleasedTicketSnapshot = {
    ticketId: string;
    movieId: string;
    room: string;
    seatNumber: number;
    visitorType: 'standard' | 'discounted';
    price: number;
    showtime: Date;
};

type CustomerSnapshot = {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
} | null;

export class TicketsReleased extends OrderDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${OrderDomainEvent.FQDN_PREFIX}.ticketsreleased`,
    );

    private readonly _orderId: string;
    private readonly _bookingId: string;
    private readonly _customer: CustomerSnapshot;
    private readonly _tickets: ReleasedTicketSnapshot[];
    private readonly _occurredOn: Date;

    private constructor(
        orderId: string,
        bookingId: string,
        customer: CustomerSnapshot,
        tickets: ReleasedTicketSnapshot[],
    ) {
        super();
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._customer = customer;
        this._tickets = tickets;
        this._occurredOn = new Date();
    }

    static create(
        orderId: string,
        bookingId: string,
        customer: Customer | null,
        tickets: ReleasedTicketSnapshot[],
    ): TicketsReleased {
        return new TicketsReleased(
            orderId,
            bookingId,
            customer
                ? {
                    salutation: customer.salutation,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email.value,
                }
                : null,
            tickets,
        );
    }

    override get FQDN() {
        return TicketsReleased.FQDN_VALUE;
    }

    override get occurredOn(): Date {
        return this._occurredOn;
    }

    get orderId(): string {
        return this._orderId;
    }

    get bookingId(): string {
        return this._bookingId;
    }

    get customer(): CustomerSnapshot {
        return this._customer;
    }

    get tickets(): ReleasedTicketSnapshot[] {
        return [...this._tickets];
    }
}
