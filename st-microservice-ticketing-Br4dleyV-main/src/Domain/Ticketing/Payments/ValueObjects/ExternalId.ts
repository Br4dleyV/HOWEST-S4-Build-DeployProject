import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class ExternalId extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): ExternalId {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException('ExternalId must be a string.');
        }

        const normalizedValue = value.trim();
        if (normalizedValue.length === 0) {
            throw new IllegalArgumentException('ExternalId must not be empty.');
        }

        return new ExternalId(normalizedValue);
    }

    get value(): string {
        return this._value;
    }

    override equals(other: ExternalId): boolean {
        return other?._value === this._value;
    }
}