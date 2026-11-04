import { assertEquals, assertFalse } from '@std/assert';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { MovieInfo } from '@/Domain/Ticketing/Orders/ValueObjects/MovieInfo.ts';

Deno.test('[Unit] - MovieInfo - fromMovie - converts movie to movie info', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );

    const movieInfo = MovieInfo.fromMovie(movie);

    assertEquals(movieInfo.id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(movieInfo.title.value, 'Example Movie');
    assertEquals(movieInfo.duration.minutes, 120);
    assertEquals(movieInfo.genres.values, ['Drama']);
    assertEquals(movieInfo.posterUrl.value, 'https://example.com/poster.png');
    assertEquals(movieInfo.ageRating.value, '12+');
    assertEquals(movieInfo.price.cents, 1100);
});

Deno.test('[Unit] - MovieInfo - reconstitute - restores movie info from snapshot', () => {
    const snapshot = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const movieInfo = MovieInfo.reconstitute(snapshot);

    assertEquals(movieInfo.id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(movieInfo.title.value, 'Example Movie');
    assertEquals(movieInfo.duration.minutes, 120);
    assertEquals(movieInfo.genres.values, ['Drama']);
    assertEquals(movieInfo.posterUrl.value, 'https://example.com/poster.png');
    assertEquals(movieInfo.ageRating.value, '12+');
    assertEquals(movieInfo.price.cents, 1000);
});

Deno.test('[Unit] - MovieInfo - getters - all properties accessible', () => {
    const snapshot = {
        movieId: 'a3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Test Movie',
        durationMinutes: 90,
        genres: ['Action', 'Sci-Fi'],
        posterUrl: 'https://test.com/poster.jpg',
        ageRating: '16+',
        priceCents: 2000,
    };

    const movieInfo = MovieInfo.reconstitute(snapshot);

    assertEquals(movieInfo.id.value, 'a3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(movieInfo.title.value, 'Test Movie');
    assertEquals(movieInfo.duration.minutes, 90);
    assertEquals(movieInfo.genres.values, ['Action', 'Sci-Fi']);
    assertEquals(movieInfo.posterUrl.value, 'https://test.com/poster.jpg');
    assertEquals(movieInfo.ageRating.value, '16+');
    assertEquals(movieInfo.price.cents, 2000);
});

Deno.test('[Unit] - MovieInfo - equals - returns true when both instances have identical values', () => {
    const snapshot = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const a = MovieInfo.reconstitute(snapshot);
    const b = MovieInfo.reconstitute(snapshot);

    assertEquals(a.equals(b), true);
});

Deno.test('[Unit] - MovieInfo - equals - returns false when other is null', () => {
    const movieInfo = MovieInfo.reconstitute({
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    });

    assertFalse(movieInfo.equals(null as unknown as MovieInfo));
});

Deno.test('[Unit] - MovieInfo - equals - returns false when id differs', () => {
    const base = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const a = MovieInfo.reconstitute(base);
    const b = MovieInfo.reconstitute({ ...base, movieId: 'c4f9a2d3-6f1c-4e0a-9a1d-123456789abc' });

    assertFalse(a.equals(b));
});

Deno.test('[Unit] - MovieInfo - equals - returns false when title differs', () => {
    const base = {
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
        priceCents: 1000,
    };

    const a = MovieInfo.reconstitute(base);
    const b = MovieInfo.reconstitute({ ...base, title: 'Other Movie' });

    assertFalse(a.equals(b));
});
