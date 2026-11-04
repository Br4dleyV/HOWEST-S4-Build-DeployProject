import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { PaymentDomainEvent } from './PaymentDomainEvent.ts';

export class PaymentFailed extends PaymentDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${PaymentDomainEvent.FQDN_PREFIX}.paymentfailed`,
    );

    private readonly _paymentId: string;
    private readonly _orderId: string;
    private readonly _bookingId: string;
    private readonly _reason: string;
    private readonly _occurredOn: Date;

    private constructor(paymentId: string, orderId: string, bookingId: string, reason: string) {
        super();
        this._paymentId = paymentId;
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._reason = reason;
        this._occurredOn = new Date();
    }

    static create(
        paymentId: string,
        orderId: string,
        bookingId: string,
        reason: string,
    ): PaymentFailed {
        return new PaymentFailed(paymentId, orderId, bookingId, reason);
    }

    override get FQDN() {
        return PaymentFailed.FQDN_VALUE;
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

    get reason(): string {
        return this._reason;
    }
}