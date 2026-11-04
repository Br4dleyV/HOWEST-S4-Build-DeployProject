import type { Document } from '@mongodb';

import { Movie, MovieId } from '@/Domain/Ticketing/Movies/mod.ts';
import { type DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { AgeRating } from '@/Domain/Ticketing/Movies/ValueObjects/AgeRating.ts';
import { Genres } from '@/Domain/Ticketing/Movies/ValueObjects/Genres.ts';
import { MovieDuration } from '@/Domain/Ticketing/Movies/ValueObjects/MovieDuration.ts';
import { MovieTitle } from '@/Domain/Ticketing/Movies/ValueObjects/MovieTitle.ts';
import { Money } from '@/Domain/Ticketing/Movies/ValueObjects/Money.ts';
import { PosterUrl } from '@/Domain/Ticketing/Movies/ValueObjects/PosterUrl.ts';

interface MovieDocumentShape {
    _id?: string;
    id?: string;
    title: string;
    durationMinutes: number;
    genres: unknown;
    posterUrl: string;
    ageRating: string;
    priceCents?: number;
}

export class MovieDocumentMapper implements DocumentMapper<Movie> {
    toDocument(movie: Movie): Document {
        return {
            _id: movie.id.value,
            title: movie.title.value,
            durationMinutes: movie.duration.minutes,
            genres: movie.genres.values,
            posterUrl: movie.posterUrl.value,
            ageRating: movie.ageRating.value,
            priceCents: movie.price.cents,
        };
    }

    reconstitute(document: Document): Movie {        
        const snapshot = document as unknown as MovieDocumentShape;

        const movie = Object.create(Movie.prototype);

        movie["_id"] = MovieId.create((snapshot._id ?? snapshot.id) as string);
        movie["_title"] = MovieTitle.create(snapshot.title);
        movie["_duration"] = MovieDuration.create(snapshot.durationMinutes);
        movie["_genres"] = Genres.create(snapshot.genres);
        movie["_posterUrl"] = PosterUrl.create(snapshot.posterUrl);
        movie["_ageRating"] = AgeRating.create(snapshot.ageRating);
        movie["_price"] = snapshot.priceCents !== undefined
            ? Money.createCents(snapshot.priceCents)
            : Money.deriveFromDuration(snapshot.durationMinutes);
        movie["_domainEvents"] = [];

        return movie;
    }
}