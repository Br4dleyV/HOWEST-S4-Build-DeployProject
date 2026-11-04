import { assertEquals } from '@std/assert';

import { MovieId } from '@/Domain/Ticketing/Movies/mod.ts';
import { serializeObjectToDocument } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

Deno.test('[Unit] - serializeObjectToDocument - serializes entity ids, dates, arrays, and nested objects', () => {
    const movieId = MovieId.create('b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    const createdOn = new Date('2026-05-12T12:00:00.000Z');

    const document = serializeObjectToDocument({
        _id: movieId,
        _createdOn: createdOn,
        _nested: {
            _title: 'Example Movie',
            _genres: ['Drama', 'Thriller'],
        },
        _count: 2,
        plain: 'value',
    });

    assertEquals(document.id, movieId.toString());
    assertEquals(document.createdOn instanceof Date, true);
    assertEquals(document.nested.title, 'Example Movie');
    assertEquals(document.nested.genres, ['Drama', 'Thriller']);
    assertEquals(document.count, 2);
    assertEquals(document.plain, 'value');
});

Deno.test('[Unit] - serializeObjectToDocument - preserves primitive values', () => {
    assertEquals(serializeObjectToDocument('text'), 'text');
    assertEquals(serializeObjectToDocument(42), 42);
    assertEquals(serializeObjectToDocument(false), false);
});
