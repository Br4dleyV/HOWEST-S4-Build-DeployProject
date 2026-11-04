import { ValueObject } from '../../../Shared/mod.ts';

export class Genres extends ValueObject {
    private readonly _values: string[];

    private constructor(values: string[]) {
        super();
        this._values = values;
    }

    static create(values: unknown): Genres {
        if (!Array.isArray(values) || values.length === 0) {
            throw new Error('Genres must be a non-empty array');
        }

        const cleaned = values.map((v) => {
            if (typeof v !== 'string' || v.trim().length === 0) {
                throw new Error('Invalid genre value');
            }

            return v.trim();
        });

        return new Genres(cleaned);
    }

    get values(): string[] {
        return this._values;
    }

    override equals(other: Genres): boolean {
        if (!other || this._values.length !== other._values.length) {
            return false;
        }

        const sortedThis = [...this._values].sort();
        const sortedOther = [...other._values].sort();

        return sortedThis.every((value, index) => value === sortedOther[index]);
    }
}