import { ValueObject } from '../../../Shared/mod.ts';

export class PosterUrl extends ValueObject {

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): PosterUrl {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Invalid poster URL');
        }

        return new PosterUrl(value.trim());
    }

    get value(): string {
        return this._value;
    }

    override equals(other: PosterUrl): boolean {
        return !!other && this._value === other._value;
    }
}
