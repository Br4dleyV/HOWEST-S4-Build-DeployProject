import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { BookingId, OrderId } from '@/Domain/Ticketing/Orders/mod.ts';
import { CardNumber } from './ValueObjects/CardNumber.ts';
import { CVV } from './ValueObjects/CVV.ts';
import { ExternalId } from './ValueObjects/ExternalId.ts';
import { FailureReason } from './ValueObjects/FailureReason.ts';
import { PaymentAmount } from './ValueObjects/PaymentAmount.ts';
import { PaymentMethod } from './ValueObjects/PaymentMethod.ts';
import { PaymentStatus, type PaymentStatusValue } from './ValueObjects/PaymentStatus.ts';
import { PaymentFailed } from './Events/PaymentFailed.ts';
import { PaymentSucceeded } from './Events/PaymentSucceeded.ts';
import { ExpiryDate } from './ValueObjects/ExpiryDate.ts';

export class PaymentId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): PaymentId {
        return new PaymentId(value);
    }
}

export class Payment extends AggregateRoot<PaymentId> {
    private readonly _externalId: ExternalId;
    private readonly _paymentMethod: PaymentMethod;
    private readonly _cardNumber: CardNumber;
    private readonly _expiryDate: ExpiryDate;
    private readonly _cvv: CVV;
    private readonly _orderId: OrderId;
    private readonly _bookingId: BookingId;
    private readonly _amount: PaymentAmount;
    private _status: PaymentStatus;

    private constructor(
        id: PaymentId,
        externalId: ExternalId,
        paymentMethod: PaymentMethod,
        cardNumber: CardNumber,
        expiryDate: ExpiryDate,
        cvv: CVV,
        orderId: OrderId,
        bookingId: BookingId,
        amount: PaymentAmount,
        status: PaymentStatus,
    ) {
        super(id);
        this._externalId = externalId;
        this._paymentMethod = paymentMethod;
        this._cardNumber = cardNumber;
        this._expiryDate = expiryDate;
        this._cvv = cvv;
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._amount = amount;
        this._status = status;
    }

    static create(
        externalId: string,
        paymentMethod: string,
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        orderId: string,
        bookingId: string,
        amount: number,
    ): Payment {
        return new Payment(
            PaymentId.create(),
            ExternalId.create(externalId),
            PaymentMethod.create(paymentMethod),
            CardNumber.create(cardNumber),
            ExpiryDate.create(expiryDate),
            CVV.create(cvv),
            OrderId.create(orderId),
            BookingId.create(bookingId),
            PaymentAmount.create(amount),
            PaymentStatus.pending(),
        );
    }

    static reconstitute(snapshot: {
        id: string;
        externalId: string;
        paymentMethod: string;
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        orderId: string;
        bookingId: string;
        amount: number;
        status: PaymentStatusValue;
    }): Payment {
        return new Payment(
            PaymentId.create(snapshot.id),
            ExternalId.create(snapshot.externalId),
            PaymentMethod.create(snapshot.paymentMethod),
            CardNumber.create(snapshot.cardNumber),
            ExpiryDate.create(snapshot.expiryDate),
            CVV.create(snapshot.cvv),
            OrderId.create(snapshot.orderId),
            BookingId.create(snapshot.bookingId),
            PaymentAmount.create(snapshot.amount),
            PaymentStatus.create(snapshot.status),
        );
    }

    override get id(): PaymentId {
        return super.id as PaymentId;
    }

    get externalId(): ExternalId {
        return this._externalId;
    }

    get paymentMethod(): PaymentMethod {
        return this._paymentMethod;
    }

    get cardNumber(): CardNumber {
        return this._cardNumber;
    }

    get expiryDate(): ExpiryDate {
        return this._expiryDate;
    }

    get cvv(): CVV {
        return this._cvv;
    }

    get orderId(): OrderId {
        return this._orderId;
    }

    get bookingId(): BookingId {
        return this._bookingId;
    }

    get amount(): PaymentAmount {
        return this._amount;
    }

    get status(): PaymentStatus {
        return this._status;
    }

    succeed(): void {
        this.ensurePending('succeeded');
        this._status = PaymentStatus.create('success');
        this.raise(PaymentSucceeded.create(this.id.value, this.orderId.value, this.bookingId.value));
    }

    fail(reason: string): void {
        this.ensurePending('failed');
        const failureReason = FailureReason.create(reason);
        this._status = PaymentStatus.create('failed');
        this.raise(
            PaymentFailed.create(
                this.id.value,
                this.orderId.value,
                this.bookingId.value,
                failureReason.value,
            ),
        );
    }

    private ensurePending(action: string): void {
        if (this._status.value !== 'pending') {
            throw new IllegalArgumentException(`Payment can only be marked as ${action} while it is pending.`);
        }
    }
}