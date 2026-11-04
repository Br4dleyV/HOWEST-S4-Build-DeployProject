import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { SuggestionDomainEvent } from './SuggestionDomainEvent.ts';

export class SuggestionCreatedDomainEvent extends SuggestionDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${SuggestionDomainEvent.FQDN_PREFIX}.created`,
    );

    private readonly _suggestionId: string;
    private readonly _email: string;
    private readonly _title: string;
    private readonly _description: string;
    private readonly _occurredOn: Date;

    private constructor(
        suggestionId: string,
        email: string,
        title: string,
        description: string,
    ) {
        super();
        this._suggestionId = suggestionId;
        this._email = email;
        this._title = title;
        this._description = description;
        this._occurredOn = new Date();
    }

    static create(
        suggestionId: string,
        email: string,
        title: string,
        description: string,
    ): SuggestionCreatedDomainEvent {
        return new SuggestionCreatedDomainEvent(
            suggestionId,
            email,
            title,
            description,
        );
    }

    override get FQDN(): EventFQDN {
        return SuggestionCreatedDomainEvent.FQDN_VALUE;
    }

    override get occurredOn(): Date {
        return this._occurredOn;
    }

    get suggestionId(): string {
        return this._suggestionId;
    }

    get email(): string {
        return this._email;
    }

    get title(): string {
        return this._title;
    }

    get description(): string {
        return this._description;
    }
}
