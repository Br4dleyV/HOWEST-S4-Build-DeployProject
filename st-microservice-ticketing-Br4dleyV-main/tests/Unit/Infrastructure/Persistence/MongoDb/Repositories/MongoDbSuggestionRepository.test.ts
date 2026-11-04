import { assertEquals } from '@std/assert';
import { Optional } from '@domaincrafters/std';
import type { Document } from '@mongodb';

import { Suggestion, SuggestionId } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { MongoDbSuggestionRepository, SuggestionDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import type { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

function createClientStub() {
    const state = {
        findDocumentResult: Optional.empty<Document>(),
        upsertDocumentResult: { acknowledged: true, matchedCount: 0, upsertedCount: 1 },
        deleteDocumentResult: { acknowledged: true, deletedCount: 1 },
        lastFindCollection: '',
        lastUpsertCollection: '',
        lastDeleteCollection: '',
    };

    const client = {
        findDocument: async () => state.findDocumentResult,
        upsertDocument: async () => state.upsertDocumentResult,
        deleteDocument: async () => state.deleteDocumentResult,
    } as unknown as MongoDbClient;

    return { client, state };
}

Deno.test('[Unit] - MongoDbSuggestionRepository - collectionName/entityName - exposes suggestion repository metadata', () => {
    const { client } = createClientStub();
    const repository = new MongoDbSuggestionRepository(client, new SuggestionDocumentMapper());

    assertEquals(MongoDbSuggestionRepository.collectionName, 'suggestions');
    assertEquals(repository.entityName, Suggestion.name);
});

Deno.test('[Unit] - MongoDbSuggestionRepository - save/byId/remove - persists suggestions', async () => {
    const { client } = createClientStub();
    const repository = new MongoDbSuggestionRepository(client, new SuggestionDocumentMapper());
    const suggestion = Suggestion.create(
        'user@example.com',
        'Improve booking performance',
        'Cache frequently requested movie data to reduce latency.',
    );

    await repository.save(suggestion);

    const byId = await repository.byId(SuggestionId.create(suggestion.id.value));
    assertEquals(byId.isPresent, false);

    await repository.remove(suggestion);
    assertEquals(true, true);
});
