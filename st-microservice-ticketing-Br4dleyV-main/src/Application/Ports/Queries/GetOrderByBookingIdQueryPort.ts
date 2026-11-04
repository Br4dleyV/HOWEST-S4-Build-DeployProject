import type { Optional } from '@domaincrafters/std';

export interface CustomerData {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface TicketData {
    ticketId: string;
    seatNumber: number;
    visitorType: string;
    price: number;
    movieId: string;
    room: string;
    showtime: string;
}

export interface OrderData {
    id: string;
    bookingId: string;
    status: string;
    price: number;
    agreeToTerms: boolean;
    customer: CustomerData | null;
    tickets: TicketData[];
}

export interface GetOrderByBookingIdQueryPort {
    getOrderByBookingId(bookingId: string): Promise<Optional<OrderData>>;
}