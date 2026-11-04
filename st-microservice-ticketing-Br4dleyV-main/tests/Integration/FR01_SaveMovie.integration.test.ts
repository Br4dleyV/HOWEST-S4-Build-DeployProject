import { assertEquals } from '@std/assert';
import { MongoClient } from '@mongodb';

import type { Logger } from '@/Application/Ports/mod.ts';
import { SaveMovie } from '@/Application/Ticketing/Movies/mod.ts';
import { SaveMovieController } from '@/Infrastructure/Messaging/LavinMQ/Controllers/mod.ts';
import { MovieId } from '@/Domain/Ticketing/Movies/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { MongoDbMovieRepository } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import { MovieDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import { MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

// Check if the environment variable is set to run integration tests
const shouldRunIntegration = Deno.env.get('RUN_FR01_INTEGRATION_TESTS') === '1';

const logger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test({
    name: '[Integration] - FR01 - MovieRegistered payload - saves movie snapshot to MongoDB',
    ignore: !shouldRunIntegration,
    sanitizeResources: false,
    sanitizeOps: false,
    async fn() {
        const dbName = 'howestprime-ticketing-fr01-it';
        const connectionString = MongoDbClient.createConnectionString(
            'mongodb',
            'localhost',
            '40131',
            'authSource=admin&directConnection=true',
            dbName,
            '',
            '',
        );

        const client = new MongoClient(connectionString, {
            directConnection: true,
        });
        await client.connect();

        const mongoDbClient = new MongoDbClient(client);
        const repository = new MongoDbMovieRepository(mongoDbClient, new MovieDocumentMapper());
        const unitOfWork = new MongoDbUnitOfWork(mongoDbClient.session);
        unitOfWork.registerRepository(repository);

        const useCase = new SaveMovie(unitOfWork, logger);
        const controller = new SaveMovieController(useCase);

        const payload = {
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 120,
            genres: ['Drama', 'Thriller'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        };

        await controller.handle(payload as never);

        const stored = await repository.byId(MovieId.create(payload.movieId));
        const movie = stored.getOrThrow();

        assertEquals(stored.isPresent, true);
        assertEquals(movie.id.value, payload.movieId);
        assertEquals(movie.title.value, payload.title);
        assertEquals(movie.duration.minutes, payload.durationMinutes);
        assertEquals(movie.genres.values, payload.genres);
        assertEquals(movie.posterUrl.value, payload.posterUrl);
        assertEquals(movie.ageRating.value, payload.ageRating);

        await client.db(dbName).dropDatabase();
        await client.close();
    },
});
