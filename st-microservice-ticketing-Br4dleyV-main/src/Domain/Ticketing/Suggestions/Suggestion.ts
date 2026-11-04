import { Email } from '@/Domain/Shared/ValueObjects/Email.ts';
import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { SuggestionCreatedDomainEvent } from './Events/SuggestionCreatedDomainEvent.ts';
import { SuggestionDescription } from './ValueObjects/SuggestionDescription.ts';
import { SuggestionTitle } from './ValueObjects/SuggestionTitle.ts';

export class SuggestionId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): SuggestionId {
        return new SuggestionId(value);
    }
}

export class Suggestion extends AggregateRoot<SuggestionId> {
    private readonly _email: Email;
    private readonly _title: SuggestionTitle;
    private readonly _description: SuggestionDescription;

    private constructor(
        id: SuggestionId,
        email: Email,
        title: SuggestionTitle,
        description: SuggestionDescription,
    ) {
        super(id);
        this._email = email;
        this._title = title;
        this._description = description;
    }

    static create(email: string, title: string, description: string): Suggestion {
        const suggestion = new Suggestion(
            SuggestionId.create(),
            Email.create(email),
            SuggestionTitle.create(title),
            SuggestionDescription.create(description),
        );

        suggestion.raise(
            SuggestionCreatedDomainEvent.create(
                suggestion.id.value,
                suggestion.email.value,
                suggestion.title.value,
                suggestion.description.value,
            ),
        );

        return suggestion;
    }

    override get id(): SuggestionId {
        return super.id as SuggestionId;
    }

    get email(): Email {
        return this._email;
    }

    get title(): SuggestionTitle {
        return this._title;
    }

    get description(): SuggestionDescription {
        return this._description;
    }
}
