import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export const PaymentStatusValues = {
    Pending: 'pending',
    Success: 'success',
    Failed: 'failed',
} as const;

export type PaymentStatusValue = (typeof PaymentStatusValues)[keyof typeof PaymentStatusValues];

export class PaymentStatus extends ValueObject {
    private readonly _value: PaymentStatusValue;

    private constructor(value: PaymentStatusValue) {
        super();
        this._value = value;
    }

    static create(value: string): PaymentStatus {
        if (
            value !== PaymentStatusValues.Pending &&
            value !== PaymentStatusValues.Success &&
            value !== PaymentStatusValues.Failed
        ) {
            throw new IllegalArgumentException(`Unsupported payment status '${value}'.`);
        }

        return new PaymentStatus(value);
    }

    static pending(): PaymentStatus {
        return new PaymentStatus(PaymentStatusValues.Pending);
    }

    get value(): PaymentStatusValue {
        return this._value;
    }

    override equals(other: PaymentStatus): boolean {
        return other?._value === this._value;
    }
}