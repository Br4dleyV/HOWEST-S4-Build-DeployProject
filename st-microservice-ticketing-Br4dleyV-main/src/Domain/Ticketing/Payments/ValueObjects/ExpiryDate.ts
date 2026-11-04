import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class ExpiryDate extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): ExpiryDate {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('ExpiryDate must be a string.');
        }

        const normalizedValue = value.trim();
        const match = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.exec(normalizedValue);
        if (!match) {
            throw new IllegalArgumentException('ExpiryDate must match MM/YY or MM/YYYY.');
        }

        return new ExpiryDate(normalizedValue);
    }

    get value(): string {
        return this._value;
    }

    override equals(other: ExpiryDate): boolean {
        return other?._value === this._value;
    }
}