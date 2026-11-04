import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';

export interface SaveMovieInput {
    movieId: string;
    title: string;
    durationMinutes: number;
    genres: unknown;
    posterUrl: string;
    ageRating: string;
}

// SaveMovie use case
export class SaveMovie implements UseCase<SaveMovieInput, void> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(
        unitOfWork: UnitOfWork,
        logger: Logger,
    ) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: SaveMovieInput): Promise<void> {
        this._logger.debug('Saving movie', { input });

        await this._unitOfWork.do(async () => {
            const movie = Movie.create(
                input.movieId,
                input.title,
                input.durationMinutes,
                input.genres,
                input.posterUrl,
                input.ageRating,
            );

            await this._unitOfWork.save(movie);

            this._logger.info('Movie saved', { movieId: movie.id.value });
        });
    }
}
