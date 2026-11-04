import { assertEquals } from '@std/assert';
import { Optional } from '@domaincrafters/std';

import { Movie, MovieId } from '@/Domain/Ticketing/Movies/mod.ts';
import { MovieDocumentMapper, MongoDbMovieRepository } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import type { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

function createStubMongoDbClient() {
    const documents = new Map<string, unknown>();

    return {
        upsertDocument: async (filter: { _id: string }, document: unknown): Promise<{ acknowledged: boolean; matchedCount: number; upsertedCount: number }> => {
            documents.set(filter._id, document);
            return { acknowledged: true, matchedCount: 0, upsertedCount: 1 };
        },
        findDocument: async (filter: { _id: string }): Promise<Optional<unknown>> => {
            const document = documents.get(filter._id);
            return document ? Optional.of(document) : Optional.empty<unknown>();
        },
        deleteDocument: async (filter: { _id: string }): Promise<{ acknowledged: boolean; deletedCount: number }> => {
            const deleted = documents.delete(filter._id);
            return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
        },
    } as unknown as MongoDbClient;
}

Deno.test('[Unit] - MongoDbMovieRepository - save/byId/remove - persists snapshots', async () => {
    const repository = new MongoDbMovieRepository(createStubMongoDbClient(), new MovieDocumentMapper());
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    assertEquals(MongoDbMovieRepository.collectionName, 'movies');
    assertEquals(repository.entityName, Movie.name);

    await repository.save(movie);

    const stored = await repository.byId(MovieId.create(movie.id.value));
    assertEquals(stored.isPresent, true);
    assertEquals(stored.getOrThrow().id.value, movie.id.value);

    await repository.remove(movie);
    const afterRemove = await repository.byId(MovieId.create(movie.id.value));
    assertEquals(afterRemove.isPresent, false);
});
