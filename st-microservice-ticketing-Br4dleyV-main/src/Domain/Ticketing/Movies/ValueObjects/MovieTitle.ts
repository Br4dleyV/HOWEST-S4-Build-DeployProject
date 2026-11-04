import { ValueObject } from '../../../Shared/mod.ts';

export class MovieTitle extends ValueObject {

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): MovieTitle {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Invalid movie title');
        }

        return new MovieTitle(value.trim());
    }

    get value(): string {
        return this._value;
    }

    override equals(other: MovieTitle): boolean {
        return !!other && this._value === other._value;
    }
}
