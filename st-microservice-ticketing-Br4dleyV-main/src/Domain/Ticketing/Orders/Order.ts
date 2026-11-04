import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { Money, Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { Customer } from './ValueObjects/Customer.ts';
import { Ticket } from './Ticket.ts';
import { CustomerInfoAdded } from './Events/CustomerInfoAdded.ts';
import { OrderPaid } from './Events/OrderPaid.ts';
import { OrderCancelled } from './Events/OrderCancelled.ts';
import { TicketsReleased } from './Events/TicketsReleased.ts';
import { MovieInfo } from './ValueObjects/MovieInfo.ts';
import { OrderStatus, type OrderStatusValue } from './ValueObjects/OrderStatus.ts';
import { Seat } from './ValueObjects/Seat.ts';
import { VisitorTypes } from './ValueObjects/VisitorType.ts';

export class OrderId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): OrderId {
        return new OrderId(value);
    }
}

export class BookingId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): BookingId {
        return new BookingId(value);
    }
}

export class Order extends AggregateRoot<OrderId> {
    private readonly _bookingId: BookingId;
    private readonly _tickets: Ticket[];
    private readonly _price: Money;
    private _status: OrderStatus;
    private _customer: Customer | null;
    private _agreeToTerms: boolean;

    private constructor(
        id: OrderId,
        bookingId: BookingId,
        tickets: Ticket[],
        price: Money,
        status: OrderStatus,
        customer: Customer | null,
        agreeToTerms: boolean,
    ) {
        super(id);
        this._bookingId = bookingId;
        this._tickets = tickets;
        this._price = price;
        this._status = status;
        this._customer = customer;
        this._agreeToTerms = agreeToTerms;
    }

    static createFromBooking(
        bookingId: string,
        movie: Movie,
        room: string,
        showtime: Date,
        standardVisitors: number,
        discountedVisitors: number,
        seatNumbers: number[],
    ): Order {
        if (!Number.isInteger(standardVisitors) || standardVisitors < 0) {
            throw new IllegalArgumentException('standardVisitors must be a non-negative integer.');
        }

        if (!Number.isInteger(discountedVisitors) || discountedVisitors < 0) {
            throw new IllegalArgumentException('discountedVisitors must be a non-negative integer.');
        }

        const totalVisitors = standardVisitors + discountedVisitors;
        if (totalVisitors <= 0) {
            throw new IllegalArgumentException('An order must include at least one visitor.');
        }

        if (!Array.isArray(seatNumbers) || seatNumbers.length !== totalVisitors) {
            throw new IllegalArgumentException(
                'seatNumbers length must match standardVisitors + discountedVisitors.',
            );
        }

        const movieInfo = MovieInfo.fromMovie(movie);
        const basePriceCents = movieInfo.price.cents;
        const discountedPriceCents = Math.round(basePriceCents * 0.9);

        const seats: Seat[] = seatNumbers.map((seatNumber, index) => {
            const visitorType = index < standardVisitors
                ? VisitorTypes.Standard
                : VisitorTypes.Discounted;

            return Seat.create(seatNumber, visitorType);
        });

        const tickets = seats.map((seat) =>
            Ticket.create(
                movieInfo,
                seat,
                room,
                showtime,
                seat.visitorType === VisitorTypes.Discounted
                    ? discountedPriceCents
                    : basePriceCents,
            )
        );

        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price.cents, 0);

        return new Order(
            OrderId.create(),
            BookingId.create(bookingId),
            tickets,
            Money.createCents(totalPrice),
            OrderStatus.open(),
            null,
            false,
        );
    }

    static reconstitute(snapshot: {
        id: string;
        bookingId: string;
        tickets: Ticket[];
        priceCents: number;
        status: OrderStatusValue;
        customer?: Customer | {
            salutation: string;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
        agreeToTerms: boolean;
    }): Order {
        return new Order(
            OrderId.create(snapshot.id),
            BookingId.create(snapshot.bookingId),
            snapshot.tickets,
            Money.createCents(snapshot.priceCents),
            OrderStatus.create(snapshot.status),
            snapshot.customer instanceof Customer
                ? snapshot.customer
                : snapshot.customer
                ? Customer.reconstitute(snapshot.customer)
                : null,
            snapshot.agreeToTerms,
        );
    }

    override get id(): OrderId {
        return super.id as OrderId;
    }

    get bookingId(): BookingId {
        return this._bookingId;
    }

    get tickets(): Ticket[] {
        return [...this._tickets];
    }

    get price(): Money {
        return this._price;
    }

    get status(): OrderStatus {
        return this._status;
    }

    get customer(): Customer | null {
        return this._customer;
    }

    get agreeToTerms(): boolean {
        return this._agreeToTerms;
    }

    acceptTerms(): void {
        if (this.status.value !== 'open') {
            throw new IllegalArgumentException('Terms can only be accepted while the order is open.');
        }

        this._agreeToTerms = true;
    }

    addCustomer(customer: Customer): void {
        if (this.status.value !== 'open') {
            throw new IllegalArgumentException('Customer information can only be added while the order is open.');
        }

        if (!this._agreeToTerms) {
            throw new IllegalArgumentException('Terms must be accepted before adding customer information.');
        }

        this._customer = customer;
        this.raise(CustomerInfoAdded.create(this.id.value, customer));
    }

    markAsPaid(): void {
        if (this.status.value !== 'open') {
            throw new IllegalArgumentException('Order can only be marked as paid while it is open.');
        }

        if (!this._agreeToTerms) {
            throw new IllegalArgumentException('Terms must be accepted before the order can be marked as paid.');
        }

        this._status = OrderStatus.create('paid');
        this.raise(OrderPaid.create(this.id.value, this.bookingId.value));
    }

    cancel(reason: string): void {
        if (this.status.value !== 'open') {
            throw new IllegalArgumentException('Order can only be cancelled while it is open.');
        }

        this._status = OrderStatus.create('cancelled');
        this.raise(OrderCancelled.create(this.id.value, this.bookingId.value, reason));
    }

    releaseTickets(): void {
        if (this.status.value !== 'paid') {
            throw new IllegalArgumentException('Tickets can only be released while the order is paid.');
        }

        this._status = OrderStatus.create('ticketReleased');
        this.raise(
            TicketsReleased.create(
                this.id.value,
                this.bookingId.value,
                this.customer,
                this.tickets.map((ticket) => ({
                    ticketId: ticket.id.value,
                    movieId: ticket.movieInfo.id.value,
                    room: ticket.room,
                    seatNumber: ticket.seat.seatNumber,
                    visitorType: ticket.seat.visitorType,
                    price: ticket.price.cents,
                    showtime: ticket.showtime,
                })),
            ),
        );
    }
}
