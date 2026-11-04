import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { OrderDomainEvent } from './OrderDomainEvent.ts';

export class OrderCancelled extends OrderDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(`${OrderDomainEvent.FQDN_PREFIX}.ordercancelled`);

    private readonly _orderId: string;
    private readonly _bookingId: string;
    private readonly _reason: string;
    private readonly _occurredOn: Date;

    private constructor(orderId: string, bookingId: string, reason: string) {
        super();
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._reason = reason;
        this._occurredOn = new Date();
    }

    static create(orderId: string, bookingId: string, reason: string): OrderCancelled {
        return new OrderCancelled(orderId, bookingId, reason);
    }

    override get FQDN() {
        return OrderCancelled.FQDN_VALUE;
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

    get reason(): string {
        return this._reason;
    }
}
