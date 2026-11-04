import type { Document } from '@mongodb';

import {
    Customer,
    Order,
    type OrderStatusValue,
    Seat,
    Ticket,
    VisitorTypes,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { type DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { MovieInfo } from '@/Domain/Ticketing/Orders/mod.ts';

interface OrderTicketDocumentShape {
    ticketId: string;
    movieInfo: {
        movieId: string;
        title: string;
        durationMinutes: number;
        genres: unknown;
        posterUrl: string;
        ageRating: string;
        priceCents: number;
    };
    seat: {
        seatNumber: number;
        visitorType: 'standard' | 'discounted';
    };
    room: string;
    showtime: string | Date;
    priceCents: number;
}

interface OrderDocumentShape {
    _id?: string;
    id?: string;
    bookingId: string;
    status: OrderStatusValue;
    priceCents: number;
    agreeToTerms: boolean;
    customer?: {
        salutation: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    tickets: OrderTicketDocumentShape[];
}

export class OrderDocumentMapper implements DocumentMapper<Order> {
    toDocument(order: Order): Document {
        return {
            _id: order.id.value,
            bookingId: order.bookingId.value,
            status: order.status.value,
            priceCents: order.price.cents,
            agreeToTerms: order.agreeToTerms,
            customer: order.customer
                ? {
                    salutation: order.customer.salutation,
                    firstName: order.customer.firstName,
                    lastName: order.customer.lastName,
                    email: order.customer.email.value,
                }
                : null,
            tickets: order.tickets.map((ticket) => ({
                ticketId: ticket.id.value,
                movieInfo: {
                    movieId: ticket.movieInfo.id.value,
                    title: ticket.movieInfo.title.value,
                    durationMinutes: ticket.movieInfo.duration.minutes,
                    genres: ticket.movieInfo.genres.values,
                    posterUrl: ticket.movieInfo.posterUrl.value,
                    ageRating: ticket.movieInfo.ageRating.value,
                    priceCents: ticket.movieInfo.price.cents,
                },
                seat: {
                    seatNumber: ticket.seat.seatNumber,
                    visitorType: ticket.seat.visitorType,
                },
                room: ticket.room,
                showtime: ticket.showtime.toISOString(),
                priceCents: ticket.price.cents,
            })),
        };
    }

    reconstitute(document: Document): Order {
        const snapshot = document as unknown as OrderDocumentShape;

        const tickets = snapshot.tickets.map((ticket) =>
            Ticket.create(
                MovieInfo.reconstitute(ticket.movieInfo),
                Seat.create(
                    ticket.seat.seatNumber,
                    ticket.seat.visitorType === VisitorTypes.Discounted
                        ? VisitorTypes.Discounted
                        : VisitorTypes.Standard,
                ),
                ticket.room,
                new Date(ticket.showtime),
                ticket.priceCents,
                ticket.ticketId,
            )
        );

        return Order.reconstitute({
            id: (snapshot._id ?? snapshot.id) as string,
            bookingId: snapshot.bookingId,
            tickets,
            priceCents: snapshot.priceCents,
            status: snapshot.status,
            customer: snapshot.customer ? Customer.reconstitute(snapshot.customer) : null,
            agreeToTerms: snapshot.agreeToTerms,
        });
    }
}
