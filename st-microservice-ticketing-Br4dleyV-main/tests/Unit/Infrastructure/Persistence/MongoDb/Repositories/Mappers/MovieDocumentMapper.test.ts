import { assertEquals } from '@std/assert';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { MovieDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';

Deno.test('[Unit] - MovieDocumentMapper - toDocument and reconstitute - round trips movie snapshot', () => {
    const mapper = new MovieDocumentMapper();
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    const document = mapper.toDocument(movie);
    const reconstituted = mapper.reconstitute(document);

    assertEquals(document._id, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(document.title, 'Example Movie');
    assertEquals(document.priceCents, 1100);
    assertEquals(reconstituted.id.value, movie.id.value);
    assertEquals(reconstituted.title.value, movie.title.value);
    assertEquals(reconstituted.duration.minutes, movie.duration.minutes);
    assertEquals(reconstituted.genres.values, movie.genres.values);
    assertEquals(reconstituted.posterUrl.value, movie.posterUrl.value);
    assertEquals(reconstituted.ageRating.value, movie.ageRating.value);
    assertEquals(reconstituted.price.cents, movie.price.cents);
});

Deno.test('[Unit] - MovieDocumentMapper - reconstitute - uses fallback id field', () => {
    const mapper = new MovieDocumentMapper();
    const movie = mapper.reconstitute({
        id: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama', 'Thriller'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
    } as never);

    assertEquals(movie.id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(movie.price.cents, 1100);
});
