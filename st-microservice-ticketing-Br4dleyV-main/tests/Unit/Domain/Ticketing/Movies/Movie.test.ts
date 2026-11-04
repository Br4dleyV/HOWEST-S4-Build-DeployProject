import { assertEquals, assertRejects } from '@std/assert';

import {
    AgeRating,
    Genres,
    Movie,
    MovieDuration,
    MovieTitle,
    Money,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - Movie - create - valid input - preserves data and derives price', () => {
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        ' Example Movie ',
        120,
        ['Drama', 'Thriller'],
        ' https://example.com/poster.png ',
        '12+',
    );

    assertEquals(movie.id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(movie.title.value, 'Example Movie');
    assertEquals(movie.duration.minutes, 120);
    assertEquals(movie.genres.values, ['Drama', 'Thriller']);
    assertEquals(movie.posterUrl.value, 'https://example.com/poster.png');
    assertEquals(movie.ageRating.value, '12+');
    assertEquals(movie.price.cents, 1100);
});

Deno.test('[Unit] - Movie - value objects - reject invalid input', async () => {
    await assertRejects(async () => {
        MovieTitle.create(' ');
    }, Error, 'Invalid movie title');
    await assertRejects(async () => {
        MovieDuration.create(0);
    }, Error, 'Invalid movie duration');
    await assertRejects(async () => {
        Genres.create([]);
    }, Error, 'Genres must be a non-empty array');
    await assertRejects(async () => {
        Genres.create('Drama' as never);
    }, Error, 'Genres must be a non-empty array');
    await assertRejects(async () => {
        Genres.create(['Drama', ''] as never);
    }, Error, 'Invalid genre value');
    await assertRejects(async () => {
        PosterUrl.create('');
    }, Error, 'Invalid poster URL');
    await assertRejects(async () => {
        AgeRating.create('');
    }, Error, 'Invalid age rating');
});

Deno.test('[Unit] - Money - deriveFromDuration - uses duration pricing rule', () => {
    const price = Money.deriveFromDuration(90);

    assertEquals(price.cents, 950);
});

Deno.test('[Unit] - Money - fromEuros - converts to cents', () => {
    const price = Money.fromEuros(12.34);

    assertEquals(price.cents, 1234);
    assertEquals(price.euros, 12.34);
});

Deno.test('[Unit] - Money - createCents - rejects negative values', async () => {
    await assertRejects(async () => {
        Money.createCents(-1);
    }, Error, 'Invalid money amount');
});

Deno.test('[Unit] - Movie value objects - equals - compares equivalent values', () => {
    assertEquals(MovieTitle.create('Example').equals(MovieTitle.create('Example')), true);
    assertEquals(MovieDuration.create(90).equals(MovieDuration.create(90)), true);
    assertEquals(Genres.create(['Drama', 'Thriller']).equals(Genres.create(['Thriller', 'Drama'])), true);
    assertEquals(PosterUrl.create('https://example.com/poster.png').equals(PosterUrl.create('https://example.com/poster.png')), true);
    assertEquals(AgeRating.create('12+').equals(AgeRating.create('12+')), true);
    assertEquals(Money.createCents(1234).equals(Money.createCents(1234)), true);
});

Deno.test('[Unit] - Movie value objects - equals - rejects different values', () => {
    assertEquals(MovieTitle.create('Example').equals(MovieTitle.create('Different')), false);
    assertEquals(MovieDuration.create(90).equals(MovieDuration.create(120)), false);
    assertEquals(Genres.create(['Drama']).equals(Genres.create(['Comedy'])), false);
    assertEquals(Genres.create(['Drama']).equals(Genres.create(['Drama', 'Thriller'])), false);
    assertEquals(PosterUrl.create('https://example.com/poster.png').equals(PosterUrl.create('https://example.com/other.png')), false);
    assertEquals(AgeRating.create('12+').equals(AgeRating.create('15+')), false);
    assertEquals(Money.createCents(1234).equals(Money.createCents(4321)), false);
});
