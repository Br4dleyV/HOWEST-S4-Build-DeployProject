export { Order, OrderId, BookingId } from './Order.ts';
export type { OrderRepository } from './OrderRepository.ts';
export { Ticket, TicketId } from './Ticket.ts';
export { Customer, CustomerSalutations, type CustomerSalutation } from './ValueObjects/Customer.ts';

export {
    OrderStatus,
    OrderStatusValues,
    type OrderStatusValue,
} from './ValueObjects/OrderStatus.ts';
export { Seat } from './ValueObjects/Seat.ts';
export { MovieInfo } from './ValueObjects/MovieInfo.ts';
export {
    VisitorTypes,
    type VisitorType,
    isVisitorType,
} from './ValueObjects/VisitorType.ts';
export { CustomerInfoAdded, OrderDomainEvent, OrderCancelled, TicketsReleased } from './Events/mod.ts';
export { OrderPaid } from './Events/OrderPaid.ts';
