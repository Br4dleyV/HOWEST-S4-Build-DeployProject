import { ValueObject } from '../../../Shared/mod.ts';

export class AgeRating extends ValueObject {

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): AgeRating {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Invalid age rating');
        }

        return new AgeRating(value.trim());
    }

    get value(): string {
        return this._value;
    }

    override equals(other: AgeRating): boolean {
        return !!other && this._value === other._value;
    }
}
