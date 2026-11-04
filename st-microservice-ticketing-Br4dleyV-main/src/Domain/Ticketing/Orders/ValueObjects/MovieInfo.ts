import { ValueObject } from '@/Domain/Shared/mod.ts';
import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import {
    AgeRating,
    Genres,
    Money,
    MovieDuration,
    MovieId,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';

export class MovieInfo extends ValueObject {
    private readonly _id: MovieId;
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
        price: Money,
    ) {
        super();
        this._id = id;
        this._title = title;
        this._duration = duration;
        this._genres = genres;
        this._posterUrl = posterUrl;
        this._ageRating = ageRating;
        this._price = price;
    }

    static fromMovie(movie: Movie): MovieInfo {
        return new MovieInfo(
            MovieId.create(movie.id.value),
            MovieTitle.create(movie.title.value),
            MovieDuration.create(movie.duration.minutes),
            Genres.create(movie.genres.values),
            PosterUrl.create(movie.posterUrl.value),
            AgeRating.create(movie.ageRating.value),
            Money.createCents(movie.price.cents),
        );
    }

    static reconstitute(snapshot: {
        movieId: string;
        title: string;
        durationMinutes: number;
        genres: unknown;
        posterUrl: string;
        ageRating: string;
        priceCents: number;
    }): MovieInfo {
        return new MovieInfo(
            MovieId.create(snapshot.movieId),
            MovieTitle.create(snapshot.title),
            MovieDuration.create(snapshot.durationMinutes),
            Genres.create(snapshot.genres),
            PosterUrl.create(snapshot.posterUrl),
            AgeRating.create(snapshot.ageRating),
            Money.createCents(snapshot.priceCents),
        );
    }

    get id(): MovieId {
        return this._id;
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

    equals(other: MovieInfo): boolean {
        return (
            !!other &&
            other.id.equals(this.id) &&
            other.title.equals(this.title) &&
            other.duration.equals(this.duration) &&
            other.genres.equals(this.genres) &&
            other.posterUrl.equals(this.posterUrl) &&
            other.ageRating.equals(this.ageRating) &&
            other.price.equals(this.price)
        );
    }
}
