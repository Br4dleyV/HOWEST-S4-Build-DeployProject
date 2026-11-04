import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export const OrderStatusValues = {
    Open: 'open',
    Paid: 'paid',
    TicketReleased: 'ticketReleased',
    Cancelled: 'cancelled',
} as const;

export type OrderStatusValue = (typeof OrderStatusValues)[keyof typeof OrderStatusValues];

export class OrderStatus extends ValueObject {
    private readonly _value: OrderStatusValue;

    private constructor(value: OrderStatusValue) {
        super();
        this._value = value;
    }

    static create(value: string): OrderStatus {
        if (
            value !== OrderStatusValues.Open &&
            value !== OrderStatusValues.Paid &&
            value !== OrderStatusValues.TicketReleased &&
            value !== OrderStatusValues.Cancelled
        ) {
            throw new IllegalArgumentException(`Unsupported order status '${value}'.`);
        }

        return new OrderStatus(value);
    }

    static open(): OrderStatus {
        return new OrderStatus(OrderStatusValues.Open);
    }

    get value(): OrderStatusValue {
        return this._value;
    }

    equals(other: OrderStatus): boolean {
        return !!other && other._value === this._value;
    }
}
