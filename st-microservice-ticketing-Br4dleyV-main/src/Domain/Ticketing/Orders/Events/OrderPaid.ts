import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { OrderDomainEvent } from './OrderDomainEvent.ts';

export class OrderPaid extends OrderDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(`${OrderDomainEvent.FQDN_PREFIX}.orderpaid`);

    private readonly _orderId: string;
    private readonly _bookingId: string;
    private readonly _occurredOn: Date;

    private constructor(orderId: string, bookingId: string) {
        super();
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._occurredOn = new Date();
    }

    static create(orderId: string, bookingId: string): OrderPaid {
        return new OrderPaid(orderId, bookingId);
    }

    override get FQDN() {
        return OrderPaid.FQDN_VALUE;
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
}