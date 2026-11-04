import type { SuggestionRepository } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { Suggestion, SuggestionId } from '@/Domain/Ticketing/Suggestions/mod.ts';
import {
    MongoDbClient,
    MongoDbRepository,
} from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { SuggestionDocumentMapper } from './Mappers/SuggestionDocumentMapper.ts';

export class MongoDbSuggestionRepository extends MongoDbRepository<Suggestion, SuggestionId>
    implements SuggestionRepository {
    static override readonly collectionName: string = 'suggestions';

    constructor(
        client: MongoDbClient,
        mapper: SuggestionDocumentMapper,
    ) {
        super(client, mapper, MongoDbSuggestionRepository.collectionName);
    }

    override get entityName(): string {
        return Suggestion.name;
    }
}
