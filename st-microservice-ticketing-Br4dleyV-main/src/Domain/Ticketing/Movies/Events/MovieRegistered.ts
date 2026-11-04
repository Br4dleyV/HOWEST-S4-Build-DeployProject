import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { MovieDomainEvent } from './MovieDomainEvent.ts';

export class MovieRegistered extends MovieDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${MovieDomainEvent.FQDN_PREFIX}.movieregistered`,
    );

    private readonly _movieId: string;
    private readonly _title: string;
    private readonly _durationMinutes: number;
    private readonly _genres: string[];
    private readonly _posterUrl: string;
    private readonly _ageRating: string;
    private readonly _occurredOn: Date;

    private constructor(
        movieId: string,
        title: string,
        durationMinutes: number,
        genres: string[],
        posterUrl: string,
        ageRating: string,
    ) {
        super();
        this._movieId = movieId;
        this._title = title;
        this._durationMinutes = durationMinutes;
        this._genres = genres;
        this._posterUrl = posterUrl;
        this._ageRating = ageRating;
        this._occurredOn = new Date();
    }

    static create(
        movieId: string,
        title: string,
        durationMinutes: number,
        genres: string[],
        posterUrl: string,
        ageRating: string,
    ): MovieRegistered {
        return new MovieRegistered(
            movieId,
            title,
            durationMinutes,
            genres,
            posterUrl,
            ageRating,
        );
    }

    override get FQDN() {
        return MovieRegistered.FQDN_VALUE;
    }

    override get occurredOn(): Date {
        return this._occurredOn;
    }

    get movieId(): string {
        return this._movieId;
    }

    get title(): string {
        return this._title;
    }

    get durationMinutes(): number {
        return this._durationMinutes;
    }

    get genres(): string[] {
        return this._genres;
    }

    get posterUrl(): string {
        return this._posterUrl;
    }

    get ageRating(): string {
        return this._ageRating;
    }
}
