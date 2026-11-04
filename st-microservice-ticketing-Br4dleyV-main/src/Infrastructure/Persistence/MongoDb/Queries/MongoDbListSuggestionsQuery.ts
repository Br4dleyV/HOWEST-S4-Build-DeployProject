import { type Collection, type Document } from '@mongodb';

import type {
    ListSuggestionsQueryPort,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

export class MongoDbListSuggestionsQuery implements ListSuggestionsQueryPort {
    private readonly _collection: Collection<Document>;

    constructor(mongoDbClient: MongoDbClient) {
        this._collection = mongoDbClient.collection<Document>('suggestions');
    }

    async listSuggestions(): Promise<SuggestionListItemReadModel[]> {
        const documents = await this._collection.find({}).toArray();
        return documents.map((document) => this.mapReadModel(document));
    }

    private mapReadModel(document: Document): SuggestionListItemReadModel {
        const source = this.asRecord(document);
        return {
            id: this.asString(source._id ?? source.id),
            email: this.asString(source.email),
            title: this.asString(source.title),
            description: this.asString(source.description),
        };
    }

    private asRecord(value: unknown): Record<string, unknown> {
        return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
    }

    private asString(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
            return String(value);
        }

        if (value !== null && typeof value === 'object') {
            const candidate = value as { toString?: () => string };
            if (typeof candidate.toString === 'function') {
                const serialized = candidate.toString();
                return serialized === '[object Object]' ? '' : serialized;
            }
        }

        return '';
    }
}
