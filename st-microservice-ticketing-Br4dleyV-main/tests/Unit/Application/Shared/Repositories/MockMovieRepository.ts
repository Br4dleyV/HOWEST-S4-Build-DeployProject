import { Optional } from '@domaincrafters/std';

import type { Movie, MovieId, MovieRepository } from '@/Domain/Ticketing/Movies/mod.ts';

interface MockMovieRepositoryOptions {
    byId?: (id: MovieId) => Promise<Optional<Movie>>;
    save?: (movie: Movie) => Promise<void>;
    remove?: (movie: Movie) => Promise<void>;
    existingMovies?: Movie[];
}

export function createMockMovieRepository(
    options: MockMovieRepositoryOptions = {},
): MovieRepository & {
    byIdCalled: boolean;
    byIdCallCount: number;
    saveCalled: boolean;
    saveCallCount: number;
    removeCalled: boolean;
    removeCallCount: number;
    savedMovies: Movie[];
    removedMovies: Movie[];
    storedMovies: Map<string, Movie>;
} {
    const storedMovies = new Map<string, Movie>(
        (options.existingMovies ?? []).map((movie) => [movie.id.value, movie]),
    );
    const savedMovies: Movie[] = [];
    const removedMovies: Movie[] = [];

    const mock = {
        byIdCalled: false,
        byIdCallCount: 0,
        saveCalled: false,
        saveCallCount: 0,
        removeCalled: false,
        removeCallCount: 0,
        savedMovies,
        removedMovies,
        storedMovies,

        byId: async (id: MovieId): Promise<Optional<Movie>> => {
            mock.byIdCalled = true;
            mock.byIdCallCount++;

            if (options.byId) {
                return await options.byId(id);
            }

            const movie = storedMovies.get(id.value);
            if (!movie) {
                return Optional.empty<Movie>();
            }

            return Optional.of<Movie>(movie);
        },

        save: async (movie: Movie): Promise<void> => {
            mock.saveCalled = true;
            mock.saveCallCount++;
            savedMovies.push(movie);

            if (options.save) {
                await options.save(movie);
                return;
            }

            storedMovies.set(movie.id.value, movie);
        },

        remove: async (movie: Movie): Promise<void> => {
            mock.removeCalled = true;
            mock.removeCallCount++;
            removedMovies.push(movie);

            if (options.remove) {
                await options.remove(movie);
                return;
            }

            storedMovies.delete(movie.id.value);
        },
    };

    return mock as MovieRepository & {
        byIdCalled: boolean;
        byIdCallCount: number;
        saveCalled: boolean;
        saveCallCount: number;
        removeCalled: boolean;
        removeCallCount: number;
        savedMovies: Movie[];
        removedMovies: Movie[];
        storedMovies: Map<string, Movie>;
    };
}
