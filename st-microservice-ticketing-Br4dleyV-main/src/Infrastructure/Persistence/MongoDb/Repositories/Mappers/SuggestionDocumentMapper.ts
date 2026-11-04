import type { Document } from '@mongodb';

import { Suggestion, SuggestionId } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { Email } from '@/Domain/Shared/mod.ts';
import { type DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { SuggestionDescription } from '@/Domain/Ticketing/Suggestions/ValueObjects/SuggestionDescription.ts';
import { SuggestionTitle } from '@/Domain/Ticketing/Suggestions/ValueObjects/SuggestionTitle.ts';

interface SuggestionDocumentShape {
    _id?: string;
    id?: string;
    email: string;
    title: string;
    description: string;
}

export class SuggestionDocumentMapper implements DocumentMapper<Suggestion> {
    toDocument(aggregate: Suggestion): Document {
        return {
            _id: aggregate.id.value,
            email: aggregate.email.value,
            title: aggregate.title.value,
            description: aggregate.description.value,
        };
    }

    reconstitute(document: Document): Suggestion {
        const snapshot = document as unknown as SuggestionDocumentShape;

        const suggestion = Object.create(Suggestion.prototype) as {
            _id: SuggestionId;
            _email: Email;
            _title: SuggestionTitle;
            _description: SuggestionDescription;
            _domainEvents: unknown[];
        };

        suggestion._id = SuggestionId.create((snapshot._id ?? snapshot.id) as string);
        suggestion._email = Email.create(snapshot.email);
        suggestion._title = SuggestionTitle.create(snapshot.title);
        suggestion._description = SuggestionDescription.create(snapshot.description);
        suggestion._domainEvents = [];

        return suggestion as unknown as Suggestion;
    }
}
