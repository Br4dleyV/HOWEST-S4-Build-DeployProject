import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 2000;

export class InvalidSuggestionDescriptionException extends DomainException {
    constructor(value: string) {
        super(`SuggestionDescription has invalid value: '${String(value)}'`);
    }
}

export class SuggestionDescription extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): SuggestionDescription {
        const normalized = value.trim();
        const instance = new SuggestionDescription(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (
            !this._value ||
            this._value.length < MIN_DESCRIPTION_LENGTH ||
            this._value.length > MAX_DESCRIPTION_LENGTH
        ) {
            throw new InvalidSuggestionDescriptionException(this._value);
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: SuggestionDescription): boolean {
        return other?._value === this._value;
    }

    override toString(): string {
        return this._value;
    }
}
