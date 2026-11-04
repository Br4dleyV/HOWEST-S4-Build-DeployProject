import { ValueObject } from '../../../Shared/mod.ts';

export class Money extends ValueObject {

    private readonly _amount: number; // cents

    private constructor(amount: number) {
        super();
        this._amount = Math.round(amount);
    }

    static createCents(cents: number): Money {
        if (!Number.isFinite(cents) || cents < 0) {
            throw new Error('Invalid money amount');
        }

        return new Money(Math.round(cents));
    }

    static fromEuros(euros: number): Money {
        return Money.createCents(Math.round(euros * 100));
    }

    static deriveFromDuration(durationMinutes: number): Money {
        // Base €5 + €0.05 per minute
        const euros = 5 + 0.05 * durationMinutes;
        return Money.fromEuros(euros);
    }

    get cents(): number {
        return this._amount;
    }

    get euros(): number {
        return this._amount / 100;
    }

    override equals(other: Money): boolean {
        return !!other && this._amount === other._amount;
    }
}
