import { assertEquals } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';
import { SaveMovie } from '@/Application/Ticketing/Movies/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import { createMockMovieRepository } from '../../Shared/Repositories/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - SaveMovie - execute - valid input - saves movie snapshot with provided id', async () => {
    const movieRepository = createMockMovieRepository();
    const unitOfWork = createMockUnitOfWork({
        repositories: new Map([[ 'Movie', movieRepository ]]),
    });
    const useCase = new SaveMovie(unitOfWork, mockLogger);

    await useCase.execute({
        movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        title: 'Example Movie',
        durationMinutes: 120,
        genres: ['Drama', 'Thriller'],
        posterUrl: 'https://example.com/poster.png',
        ageRating: '12+',
    });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(unitOfWork.saveCallCount, 1);
    assertEquals(movieRepository.saveCalled, true);
    assertEquals(movieRepository.saveCallCount, 1);
    const savedMovie = movieRepository.savedMovies[0]!;
    assertEquals(savedMovie.id.value, 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc');
    assertEquals(savedMovie.title.value, 'Example Movie');
});
