import type { UseCase } from '@/Application/Ports/mod.ts';
import type { SaveMovieInput } from '@/Application/Ticketing/Movies/mod.ts';
import type { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { AgeRating, Genres, MovieDuration, MovieId, MovieTitle, PosterUrl } from '../../../../Domain/Ticketing/Movies/mod.ts';

export interface SaveMovieRequest {
    movieId: MovieId;
    title: MovieTitle;
    durationMinutes: MovieDuration;
    genres: Genres;
    posterUrl: PosterUrl;
    ageRating: AgeRating;
}

export class SaveMovieController implements AmqpController<SaveMovieRequest> {
    private readonly _useCase: UseCase<SaveMovieInput, void>;

    constructor(useCase: UseCase<SaveMovieInput, void>) {
        this._useCase = useCase;
    }

    async handle(request: SaveMovieRequest): Promise<void> {
        const input: SaveMovieInput = this.extractInput(request);
        await this._useCase.execute(input);
    }

    private extractInput(request: SaveMovieRequest): SaveMovieInput {
        if (request === null || typeof request !== 'object') {
            throw new IllegalArgumentException('MovieRegistered payload must be a JSON object.');
        }

        const payload = Object.hasOwn(request, 'payload')
            ? (request as unknown as { payload: SaveMovieRequest }).payload
            : request;

        return {
            movieId: this.requireNonEmptyString(payload.movieId, 'movieId'),
            title: this.requireNonEmptyString(payload.title, 'title'),
            durationMinutes: this.requirePositiveNumber(payload.durationMinutes, 'durationMinutes'),
            genres: payload.genres,
            posterUrl: this.requireNonEmptyString(payload.posterUrl, 'posterUrl'),
            ageRating: this.requireNonEmptyString(payload.ageRating, 'ageRating'),
        };
    }

    private requireNonEmptyString(value: unknown, fieldName: string): string {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a string.`);
        }

        if (value.trim().length === 0) {
            throw new IllegalArgumentException(`Field '${fieldName}' must not be empty.`);
        }

        return value;
    }

    private requirePositiveNumber(value: unknown, fieldName: string): number {
        if (typeof value !== 'number') {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a number.`);
        }

        if (!Number.isFinite(value) || value <= 0) {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a positive number.`);
        }

        return value;
    }
}
