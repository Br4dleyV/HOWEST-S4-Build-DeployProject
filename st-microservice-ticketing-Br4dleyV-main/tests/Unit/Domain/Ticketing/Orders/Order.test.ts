import { assertEquals, assertThrows } from '@std/assert';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import {
    Customer,
    Order,
    OrderId,
    BookingId,
    Ticket,
    Seat,
    VisitorTypes,
    OrderStatus,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { MovieInfo } from '@/Domain/Ticketing/Orders/ValueObjects/MovieInfo.ts';

Deno.test('[Unit] - Order - createFromBooking - generates tickets and total price', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    assertEquals(order.bookingId.value, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(order.status.value, 'open');
    assertEquals(order.customer, null);
    assertEquals(order.agreeToTerms, false);
    assertEquals(order.tickets.length, 3);
    assertEquals(order.tickets[0]?.seat.visitorType, VisitorTypes.Standard);
    assertEquals(order.tickets[1]?.seat.visitorType, VisitorTypes.Standard);
    assertEquals(order.tickets[2]?.seat.visitorType, VisitorTypes.Discounted);

    const basePrice = movie.price.cents;
    const discountedPrice = Math.round(basePrice * 0.9);
    assertEquals(order.tickets[0]?.price.cents, basePrice);
    assertEquals(order.tickets[2]?.price.cents, discountedPrice);
    assertEquals(order.price.cents, basePrice + basePrice + discountedPrice);
});

Deno.test('[Unit] - Order - createFromBooking - zero visitors throws', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    assertThrows(
        () => Order.createFromBooking(
            '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movie,
            'Room A',
            new Date('2026-05-20T19:30:00.000Z'),
            0,
            0,
            [],
        ),
        Error,
    );
});

Deno.test('[Unit] - Order - createFromBooking - mismatched seatNumbers throws', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    assertThrows(
        () => Order.createFromBooking(
            '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movie,
            'Room A',
            new Date('2026-05-20T19:30:00.000Z'),
            2,
            1,
            [12, 13],
        ),
        Error,
    );
});

Deno.test('[Unit] - Order - createFromBooking - negative standardVisitors throws', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    assertThrows(
        () => Order.createFromBooking(
            '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movie,
            'Room A',
            new Date('2026-05-20T19:30:00.000Z'),
            -1,
            1,
            [12, 13],
        ),
        Error,
    );
});

Deno.test('[Unit] - Order - createFromBooking - negative discountedVisitors throws', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    assertThrows(
        () => Order.createFromBooking(
            '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movie,
            'Room A',
            new Date('2026-05-20T19:30:00.000Z'),
            1,
            -1,
            [12, 13],
        ),
        Error,
    );
});

Deno.test('[Unit] - Order - reconstitute - restores order from snapshot', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };
    
    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
        'd3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
    );

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'open',
        agreeToTerms: true,
    });

    assertEquals(reconstituted.id.value, 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(reconstituted.bookingId.value, 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(reconstituted.tickets.length, 1);
    assertEquals(reconstituted.price.cents, 1000);
    assertEquals(reconstituted.status.value, 'open');
    assertEquals(reconstituted.agreeToTerms, true);
});

Deno.test('[Unit] - Order - addCustomer - when terms accepted - stores customer and raises event', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    order.acceptTerms();
    order.addCustomer(Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com'));

    assertEquals(order.customer?.firstName, 'Jane');
    assertEquals(order.customer?.email.value, 'jane.doe@example.com');
    assertEquals(order.agreeToTerms, true);
    assertEquals(order.hasDomainEvents(), true);
});

Deno.test('[Unit] - Order - addCustomer - without accepted terms throws', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    assertThrows(
        () => order.addCustomer(Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com')),
        Error,
    );
});

Deno.test('[Unit] - Order - releaseTickets - when paid - changes status and raises event', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    order.acceptTerms();
    order.markAsPaid();
    order.pullDomainEvents();
    order.releaseTickets();

    const events = order.pullDomainEvents();

    assertEquals(order.status.value, 'ticketReleased');
    assertEquals(events[0]?.constructor.name, 'TicketsReleased');
    const ticketsReleased = events[0] as unknown as {
        orderId: string;
        bookingId: string;
        customer: { firstName: string } | null;
        tickets: Array<{ ticketId: string; seatNumber: number }>;
    };
    assertEquals(ticketsReleased.orderId, order.id.value);
    assertEquals(ticketsReleased.bookingId, order.bookingId.value);
    assertEquals(ticketsReleased.tickets.length, 3);
});

Deno.test('[Unit] - Ticket - create - with invalid room throws', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    assertThrows(
        () => Ticket.create(
            MovieInfo.reconstitute(movieInfo),
            Seat.create(12, VisitorTypes.Standard),
            '   ',
            new Date('2026-05-20T19:30:00.000Z'),
            1000,
        ),
        Error,
    );
});

Deno.test('[Unit] - Ticket - create - with invalid showtime throws', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    assertThrows(
        () => Ticket.create(
            MovieInfo.reconstitute(movieInfo),
            Seat.create(12, VisitorTypes.Standard),
            'Room A',
            new Date('invalid'),
            1000,
        ),
        Error,
    );
});

Deno.test('[Unit] - Seat - create - with invalid seat number throws', () => {
    assertThrows(
        () => Seat.create(0, VisitorTypes.Standard),
        Error,
    );
});

Deno.test('[Unit] - Seat - create - with negative seat number throws', () => {
    assertThrows(
        () => Seat.create(-1, VisitorTypes.Standard),
        Error,
    );
});

Deno.test('[Unit] - Seat - create - with invalid visitor type throws', () => {
    assertThrows(
        () => Seat.create(12, 'invalid' as never),
        Error,
    );
});

Deno.test('[Unit] - Seat - equals - same seat returns true', () => {
    const seat1 = Seat.create(12, VisitorTypes.Standard);
    const seat2 = Seat.create(12, VisitorTypes.Standard);

    assertEquals(seat1.equals(seat2), true);
});

Deno.test('[Unit] - Seat - equals - different seat number returns false', () => {
    const seat1 = Seat.create(12, VisitorTypes.Standard);
    const seat2 = Seat.create(13, VisitorTypes.Standard);

    assertEquals(seat1.equals(seat2), false);
});

Deno.test('[Unit] - Seat - equals - different visitor type returns false', () => {
    const seat1 = Seat.create(12, VisitorTypes.Standard);
    const seat2 = Seat.create(12, VisitorTypes.Discounted);

    assertEquals(seat1.equals(seat2), false);
});

Deno.test('[Unit] - Seat - equals - null seat returns false', () => {
    const seat = Seat.create(12, VisitorTypes.Standard);

    assertEquals(seat.equals(null as never), false);
});

Deno.test('[Unit] - OrderStatus - create - valid status succeeds', () => {
    const status = OrderStatus.create('paid');
    assertEquals(status.value, 'paid');
});

Deno.test('[Unit] - OrderStatus - create - invalid status throws', () => {
    assertThrows(
        () => OrderStatus.create('invalid'),
        Error,
    );
});

Deno.test('[Unit] - OrderStatus - open - creates open status', () => {
    const status = OrderStatus.open();
    assertEquals(status.value, 'open');
});

Deno.test('[Unit] - OrderStatus - equals - same status returns true', () => {
    const status1 = OrderStatus.open();
    const status2 = OrderStatus.open();

    assertEquals(status1.equals(status2), true);
});

Deno.test('[Unit] - OrderStatus - equals - different status returns false', () => {
    const status1 = OrderStatus.open();
    const status2 = OrderStatus.create('paid');

    assertEquals(status1.equals(status2), false);
});

Deno.test('[Unit] - OrderStatus - equals - null status returns false', () => {
    const status = OrderStatus.open();

    assertEquals(status.equals(null as never), false);
});

Deno.test('[Unit] - OrderId - create - generates UUID when no value provided', () => {
    const id1 = OrderId.create();
    const id2 = OrderId.create();

    assertEquals(id1.value !== id2.value, true);
});

Deno.test('[Unit] - OrderId - create - uses provided value', () => {
    const id = OrderId.create('b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');

    assertEquals(id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
});

Deno.test('[Unit] - BookingId - create - generates UUID when no value provided', () => {
    const id1 = BookingId.create();
    const id2 = BookingId.create();

    assertEquals(id1.value !== id2.value, true);
});

Deno.test('[Unit] - BookingId - create - uses provided value', () => {
    const id = BookingId.create('c3f9a2d3-6f1c-4e0a-9a1d-123456789abc');

    assertEquals(id.value, 'c3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
});

Deno.test('[Unit] - Order - acceptTerms - sets agreeToTerms flag when status is open', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1,
        0,
        [12],
    );

    assertEquals(order.agreeToTerms, false);
    order.acceptTerms();
    assertEquals(order.agreeToTerms, true);
});

Deno.test('[Unit] - Order - acceptTerms - throws when status is not open', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
    );

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'paid',
        agreeToTerms: true,
    });

    assertThrows(
        () => reconstituted.acceptTerms(),
        Error,
    );
});

Deno.test('[Unit] - Order - addCustomer - throws when order status is not open', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
    );

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'cancelled',
        agreeToTerms: true,
    });

    assertThrows(
        () => reconstituted.addCustomer(Customer.create('Mr.', 'John', 'Doe', 'john@example.com')),
        Error,
    );
});

Deno.test('[Unit] - Order - reconstitute - with customer object as Customer instance', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
    );

    const customer = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'open',
        customer: customer,
        agreeToTerms: true,
    });

    assertEquals(reconstituted.customer?.firstName, 'Jane');
    assertEquals(reconstituted.customer?.email.value, 'jane@example.com');
});

Deno.test('[Unit] - Order - reconstitute - with customer as plain object', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
    );

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'open',
        customer: {
            salutation: 'Mr.',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
        },
        agreeToTerms: true,
    });

    assertEquals(reconstituted.customer?.firstName, 'John');
    assertEquals(reconstituted.customer?.email.value, 'john@example.com');
});

Deno.test('[Unit] - Order - reconstitute - with null customer', () => {
    const movieInfo = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const ticket = Ticket.create(
        MovieInfo.reconstitute(movieInfo),
        Seat.create(12, VisitorTypes.Standard),
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1000,
    );

    const reconstituted = Order.reconstitute({
        id: 'e3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        bookingId: 'f3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        tickets: [ticket],
        priceCents: 1000,
        status: 'open',
        customer: null,
        agreeToTerms: false,
    });

    assertEquals(reconstituted.customer, null);
});

Deno.test('[Unit] - Order - createFromBooking - single standard visitor', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        1,
        0,
        [1],
    );

    assertEquals(order.tickets.length, 1);
    assertEquals(order.tickets[0]?.seat.visitorType, VisitorTypes.Standard);
});

Deno.test('[Unit] - Order - createFromBooking - single discounted visitor', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        0,
        1,
        [1],
    );

    assertEquals(order.tickets.length, 1);
    assertEquals(order.tickets[0]?.seat.visitorType, VisitorTypes.Discounted);
});

Deno.test('[Unit] - Order - tickets getter - returns copy of tickets array', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    const tickets1 = order.tickets;
    const tickets2 = order.tickets;

    assertEquals(tickets1.length, tickets2.length);
    assertEquals(tickets1 !== tickets2, true);
});
