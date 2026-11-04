import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 120;

export class InvalidSuggestionTitleException extends DomainException {
    constructor(value: string) {
        super(`SuggestionTitle has invalid value: '${String(value)}'`);
    }
}

export class SuggestionTitle extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): SuggestionTitle {
        const normalized = value.trim();
        const instance = new SuggestionTitle(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (
            !this._value ||
            this._value.length < MIN_TITLE_LENGTH ||
            this._value.length > MAX_TITLE_LENGTH
        ) {
            throw new InvalidSuggestionTitleException(this._value);
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: SuggestionTitle): boolean {
        return other?._value === this._value;
    }

    override toString(): string {
        return this._value;
    }
}
