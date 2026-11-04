import { ValueObject } from '../../../Shared/mod.ts';

export class MovieDuration extends ValueObject {

    private readonly _minutes: number;

    private constructor(minutes: number) {
        super();
        this._minutes = minutes;
    }

    static create(minutes: number): MovieDuration {
        if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
            throw new Error('Invalid movie duration');
        }

        return new MovieDuration(Math.round(minutes));
    }

    get minutes(): number {
        return this._minutes;
    }

    override equals(other: MovieDuration): boolean {
        return !!other && this._minutes === other._minutes;
    }
}
