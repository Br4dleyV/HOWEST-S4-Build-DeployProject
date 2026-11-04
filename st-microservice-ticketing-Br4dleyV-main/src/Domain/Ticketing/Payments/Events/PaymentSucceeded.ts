import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { PaymentDomainEvent } from './PaymentDomainEvent.ts';

export class PaymentSucceeded extends PaymentDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${PaymentDomainEvent.FQDN_PREFIX}.paymentsuccess`,
    );

    private readonly _paymentId: string;
    private readonly _orderId: string;
    private readonly _bookingId: string;
    private readonly _occurredOn: Date;

    private constructor(paymentId: string, orderId: string, bookingId: string) {
        super();
        this._paymentId = paymentId;
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._occurredOn = new Date();
    }

    static create(paymentId: string, orderId: string, bookingId: string): PaymentSucceeded {
        return new PaymentSucceeded(paymentId, orderId, bookingId);
    }

    override get FQDN() {
        return PaymentSucceeded.FQDN_VALUE;
    }

    override get occurredOn(): Date {
        return this._occurredOn;
    }

    get paymentId(): string {
        return this._paymentId;
    }

    get orderId(): string {
        return this._orderId;
    }

    get bookingId(): string {
        return this._bookingId;
    }
}