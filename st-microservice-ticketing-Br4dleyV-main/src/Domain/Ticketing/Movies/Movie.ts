import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { MovieTitle } from './ValueObjects/MovieTitle.ts';
import { MovieDuration } from './ValueObjects/MovieDuration.ts';
import { Genres } from './ValueObjects/Genres.ts';
import { PosterUrl } from './ValueObjects/PosterUrl.ts';
import { AgeRating } from './ValueObjects/AgeRating.ts';
import { Money } from './ValueObjects/Money.ts';

export class MovieId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): MovieId {
        return new MovieId(value);
    }
}

export class Movie extends AggregateRoot<MovieId> {
    private readonly _title: MovieTitle;
    private readonly _duration: MovieDuration;
    private readonly _genres: Genres;
    private readonly _posterUrl: PosterUrl;
    private readonly _ageRating: AgeRating;
    private readonly _price: Money;

    private constructor(
        id: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genres,
        posterUrl: PosterUrl,
        ageRating: AgeRating,
    ) {
        super(id);
        this._title = title;
        this._duration = duration;
        this._genres = genres;
        this._posterUrl = posterUrl;
        this._ageRating = ageRating;
        this._price = Money.deriveFromDuration(this._duration.minutes);
    }

    static create(
        movieId: string,
        title: string,
        durationMinutes: number,
        genres: unknown,
        posterUrl: string,
        ageRating: string,
    ): Movie {
        const movie = new Movie(
            MovieId.create(movieId),
            MovieTitle.create(title),
            MovieDuration.create(durationMinutes),
            Genres.create(genres),
            PosterUrl.create(posterUrl),
            AgeRating.create(ageRating),
        );

        return movie;
    }

    override get id(): MovieId {
        return super.id as MovieId;
    }

    get title(): MovieTitle {
        return this._title;
    }

    get duration(): MovieDuration {
        return this._duration;
    }

    get genres(): Genres {
        return this._genres;
    }

    get posterUrl(): PosterUrl {
        return this._posterUrl;
    }

    get ageRating(): AgeRating {
        return this._ageRating;
    }

    get price(): Money {
        return this._price;
    }
}
