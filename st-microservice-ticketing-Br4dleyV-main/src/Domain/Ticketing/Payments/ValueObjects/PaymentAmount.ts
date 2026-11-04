import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class PaymentAmount extends ValueObject {
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }

    static create(value: number): PaymentAmount {
        if (!Number.isFinite(value) || value <= 0) {
            throw new IllegalArgumentException('PaymentAmount must be finite and greater than 0.');
        }

        return new PaymentAmount(value);
    }

    get value(): number {
        return this._value;
    }

    override equals(other: PaymentAmount): boolean {
        return other?._value === this._value;
    }
}