import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class CVV extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CVV {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('CVV must be a string.');
        }

        const normalizedValue = value.trim();
        if (!/^\d{3,4}$/.test(normalizedValue)) {
            throw new IllegalArgumentException('CVV must contain 3 or 4 digits.');
        }

        return new CVV(normalizedValue);
    }

    get value(): string {
        return this._value;
    }

    override equals(other: CVV): boolean {
        return other?._value === this._value;
    }
}