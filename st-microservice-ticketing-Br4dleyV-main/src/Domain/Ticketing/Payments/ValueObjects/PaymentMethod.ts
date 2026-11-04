import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export const PaymentMethodValues = {
    CreditCard: 'Credit Card',
    BankTransfer: 'Bank Transfer',
} as const;

export type PaymentMethodValue = (typeof PaymentMethodValues)[keyof typeof PaymentMethodValues];

export class PaymentMethod extends ValueObject {
    private readonly _value: PaymentMethodValue;

    private constructor(value: PaymentMethodValue) {
        super();
        this._value = value;
    }

    static create(value: string): PaymentMethod {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('PaymentMethod must be a string.');
        }

        const normalizedValue = value.trim();
        if (normalizedValue !== PaymentMethodValues.CreditCard && normalizedValue !== PaymentMethodValues.BankTransfer) {
            throw new IllegalArgumentException(`Unsupported payment method '${value}'.`);
        }

        return new PaymentMethod(normalizedValue);
    }

    get value(): PaymentMethodValue {
        return this._value;
    }

    override equals(other: PaymentMethod): boolean {
        return other?._value === this._value;
    }
}