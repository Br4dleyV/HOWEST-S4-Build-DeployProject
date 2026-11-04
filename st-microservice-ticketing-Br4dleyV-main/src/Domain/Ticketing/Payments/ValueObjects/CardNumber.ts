import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class CardNumber extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CardNumber {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('CardNumber must be a string.');
        }

        const normalizedValue = value.trim();
        if (!/^\d{12,19}$/.test(normalizedValue)) {
            throw new IllegalArgumentException('CardNumber must contain 12 to 19 digits.');
        }

        return new CardNumber(normalizedValue);
    }

    get value(): string {
        return this._value;
    }

    override equals(other: CardNumber): boolean {
        return other?._value === this._value;
    }
}