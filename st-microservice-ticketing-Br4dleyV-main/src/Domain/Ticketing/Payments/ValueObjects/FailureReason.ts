import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class FailureReason extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): FailureReason {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('FailureReason must be a string.');
        }

        const normalizedValue = value.trim();
        if (normalizedValue.length === 0) {
            throw new IllegalArgumentException('FailureReason must not be empty.');
        }

        return new FailureReason(normalizedValue);
    }

    get value(): string {
        return this._value;
    }

    override equals(other: FailureReason): boolean {
        return other?._value === this._value;
    }
}