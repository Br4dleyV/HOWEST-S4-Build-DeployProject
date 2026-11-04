/**
 * Fully Qualified Domain Name for Domain Events
 *
 * Represents the unique identifier for a domain event type across the system.
 * Format: Namespace.BoundedContext.EventName
 * Example: "Howestprime.Ticketing.TournamentCreated"
 */
export class EventFQDN {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    static create(value: string): EventFQDN {
        if (!value || value.trim().length === 0) {
            throw new Error('Event FQDN cannot be empty');
        }

        // Validate format: should contain at least 2 parts separated by dots
        const parts = value.split('.');
        if (parts.length < 2) {
            throw new Error(
                'Event FQDN must contain at least namespace and event name (e.g., "Namespace.EventName")',
            );
        }

        // Validate each part is not empty
        if (parts.some((part) => part.trim().length === 0)) {
            throw new Error('Event FQDN parts cannot be empty');
        }

        return new EventFQDN(value);
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this._value;
    }

    equals(other: EventFQDN): boolean {
        return this._value === other._value;
    }
}
