import { DomainException, Email, ValueObject } from '@/Domain/Shared/mod.ts';

export const CustomerSalutations = ['Mr.', 'Ms.', 'Mx.'] as const;
export type CustomerSalutation = typeof CustomerSalutations[number];

export class InvalidCustomerSalutationException extends DomainException {
    constructor(value: string) {
        super(`CustomerSalutation has invalid value: '${String(value)}'`);
    }
}

export class InvalidCustomerNameException extends DomainException {
    constructor(fieldName: string, value: string) {
        super(`${fieldName} has invalid value: '${String(value)}'`);
    }
}

export class Customer extends ValueObject {
    private readonly _salutation: CustomerSalutation;
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _email: Email;

    private constructor(
        salutation: CustomerSalutation,
        firstName: string,
        lastName: string,
        email: Email,
    ) {
        super();
        this._salutation = salutation;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
    }

    static create(
        salutation: string,
        firstName: string,
        lastName: string,
        email: string,
    ): Customer {
        const rawSalutation = salutation.trim();
        // Accept common variants: case-insensitive and with/without trailing dot
        const key = rawSalutation.replace(/\./g, '').toLowerCase();
        const map: Record<string, CustomerSalutation> = {
            'mr': 'Mr.',
            'ms': 'Ms.',
            'mx': 'Mx.',
        };

        const normalizedSalutation = map[key] ?? (CustomerSalutations.includes(rawSalutation as CustomerSalutation) ? rawSalutation as CustomerSalutation : undefined);

        if (!normalizedSalutation) {
            throw new InvalidCustomerSalutationException(rawSalutation);
        }

        const normalizedFirstName = firstName.trim();
        if (normalizedFirstName.length === 0) {
            throw new InvalidCustomerNameException('CustomerFirstName', normalizedFirstName);
        }

        const normalizedLastName = lastName.trim();
        if (normalizedLastName.length === 0) {
            throw new InvalidCustomerNameException('CustomerLastName', normalizedLastName);
        }

        return new Customer(
            normalizedSalutation as CustomerSalutation,
            normalizedFirstName,
            normalizedLastName,
            Email.create(email),
        );
    }

    static reconstitute(snapshot: {
        salutation: string;
        firstName: string;
        lastName: string;
        email: string;
    }): Customer {
        return Customer.create(snapshot.salutation, snapshot.firstName, snapshot.lastName, snapshot.email);
    }

    get salutation(): CustomerSalutation {
        return this._salutation;
    }

    get firstName(): string {
        return this._firstName;
    }

    get lastName(): string {
        return this._lastName;
    }

    get email(): Email {
        return this._email;
    }

    equals(other: Customer): boolean {
        return !!other &&
            other.salutation === this.salutation &&
            other.firstName === this.firstName &&
            other.lastName === this.lastName &&
            other.email.equals(this.email);
    }
}