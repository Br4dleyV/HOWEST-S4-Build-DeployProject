import { type Collection, type Document, type Filter } from '@mongodb';
import { Optional } from '@domaincrafters/std';

import type {
    GetSuggestionByIdQueryPort,
    SuggestionByIdReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

export class MongoDbGetSuggestionByIdQuery implements GetSuggestionByIdQueryPort {
    private readonly _collection: Collection<Document>;

    constructor(mongoDbClient: MongoDbClient) {
        this._collection = mongoDbClient.collection<Document>('suggestions');
    }

    async getSuggestionById(suggestionId: string): Promise<Optional<SuggestionByIdReadModel>> {
        const filter: Filter<Document> = {
            _id: suggestionId,
        } as unknown as Filter<Document>;

        const document = await this._collection.findOne(filter);
        if (!document) {
            return Optional.empty<SuggestionByIdReadModel>();
        }

        return Optional.of<SuggestionByIdReadModel>(this.mapReadModel(document));
    }

    private mapReadModel(document: Document): SuggestionByIdReadModel {
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
