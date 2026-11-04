import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InvalidEmailException extends DomainException {
    constructor(value: string) {
        super(`Email has invalid value: '${String(value)}'`);
    }
}

export class Email extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): Email {
        const normalized = value.trim().toLowerCase();
        const instance = new Email(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!this._value || !EMAIL_REGEX.test(this._value)) {
            throw new InvalidEmailException(this._value);
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: Email): boolean {
        return other?._value === this._value;
    }

    override toString(): string {
        return this._value;
    }
}
