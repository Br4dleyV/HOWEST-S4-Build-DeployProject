import { assertEquals, assertRejects, assertThrows } from '@std/assert';
import { Optional } from '@domaincrafters/std';
import type { Document } from '@mongodb';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { MongoDbRepository, type DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import type { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

class TestMovieRepository extends MongoDbRepository<Movie> {
    constructor(client: MongoDbClient, mapper: DocumentMapper<Movie>, collectionName = 'movies') {
        super(client, mapper, collectionName);
    }

    override get entityName(): string {
        return Movie.name;
    }

    allByPipelinePublic(pipeline: Document[]): Promise<Movie[]> {
        return this.allByPipeline(pipeline);
    }
}

function createClientStub() {
    const state = {
        findDocumentResult: Optional.empty<Document>(),
        findDocumentsByPipelineResult: [{
            _id: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 120,
            genres: ['Drama', 'Thriller'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        }],
        upsertDocumentResult: { acknowledged: true, matchedCount: 0, upsertedCount: 1 },
        deleteDocumentResult: { acknowledged: true, deletedCount: 1 },
        lastFindFilter: undefined as unknown,
        lastFindCollection: '',
        lastPipeline: undefined as unknown,
        lastPipelineCollection: '',
        lastUpsertFilter: undefined as unknown,
        lastUpsertDocument: undefined as unknown,
        lastUpsertCollection: '',
        lastDeleteFilter: undefined as unknown,
        lastDeleteCollection: '',
    };

    const client = {
        findDocument: async (filter: unknown, collectionName: string) => {
            state.lastFindFilter = filter;
            state.lastFindCollection = collectionName;
            return state.findDocumentResult;
        },
        findDocumentsByPipeline: async (pipeline: unknown, collectionName: string) => {
            state.lastPipeline = pipeline;
            state.lastPipelineCollection = collectionName;
            return state.findDocumentsByPipelineResult as Document[];
        },
        upsertDocument: async (filter: unknown, document: unknown, collectionName: string) => {
            state.lastUpsertFilter = filter;
            state.lastUpsertDocument = document;
            state.lastUpsertCollection = collectionName;
            return state.upsertDocumentResult;
        },
        deleteDocument: async (filter: unknown, collectionName: string) => {
            state.lastDeleteFilter = filter;
            state.lastDeleteCollection = collectionName;
            return state.deleteDocumentResult;
        },
    } as unknown as MongoDbClient;

    return { client, state };
}

const movieMapper: DocumentMapper<Movie> = {
    toDocument: (movie: Movie) => ({
        _id: movie.id.value,
        title: movie.title.value,
        durationMinutes: movie.duration.minutes,
        genres: movie.genres.values,
        posterUrl: movie.posterUrl.value,
        ageRating: movie.ageRating.value,
    }),
    reconstitute: (document: Document) => Movie.create(
        (document._id ?? document.id) as string,
        document.title as string,
        document.durationMinutes as number,
        document.genres as unknown,
        document.posterUrl as string,
        document.ageRating as string,
    ),
};

Deno.test('[Unit] - MongoDbRepository - constructor - empty collection name - throws', () => {
    const { client } = createClientStub();

    assertThrows(() => new TestMovieRepository(client, movieMapper, ''), Error);
});

Deno.test('[Unit] - MongoDbRepository - byId/save/remove/allByPipeline - uses underlying client', async () => {
    const { client, state } = createClientStub();
    const repository = new TestMovieRepository(client, movieMapper);
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    const found = await repository.byId(movie.id);
    assertEquals(found.isPresent, false);
    assertEquals(state.lastFindCollection, 'movies');

    state.findDocumentResult = Optional.of<Document>({
        _id: movie.id.value,
        title: movie.title.value,
        durationMinutes: movie.duration.minutes,
        genres: movie.genres.values,
        posterUrl: movie.posterUrl.value,
        ageRating: movie.ageRating.value,
    });

    const present = await repository.byId(movie.id);
    assertEquals(present.isPresent, true);
    assertEquals(present.getOrThrow().id.value, movie.id.value);

    await repository.save(movie);
    assertEquals(state.lastUpsertCollection, 'movies');
    assertEquals(state.lastUpsertFilter, { _id: movie.id.value });

    const all = await repository.allByPipelinePublic([{ $match: {} }]);
    assertEquals(all.length, 1);
    assertEquals(state.lastPipelineCollection, 'movies');

    await repository.remove(movie);
    assertEquals(state.lastDeleteCollection, 'movies');
    assertEquals(state.lastDeleteFilter, { _id: movie.id.value });
});

Deno.test('[Unit] - MongoDbRepository - save/remove - rejects when persistence fails', async () => {
    const { client, state } = createClientStub();
    const repository = new TestMovieRepository(client, movieMapper);
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    state.upsertDocumentResult = { acknowledged: false, matchedCount: 0, upsertedCount: 0 };
    await assertRejects(() => repository.save(movie), Error, 'was not upserted');

    state.deleteDocumentResult = { acknowledged: true, deletedCount: 0 };
    await assertRejects(() => repository.remove(movie), Error, 'was not deleted');
});
