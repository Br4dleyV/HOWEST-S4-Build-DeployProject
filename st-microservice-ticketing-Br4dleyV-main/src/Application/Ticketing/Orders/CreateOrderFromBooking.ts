import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import { Movie, MovieId, type MovieRepository } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order } from '@/Domain/Ticketing/Orders/mod.ts';

export interface CreateOrderFromBookingInput {
    bookingId: string;
    movieId: string;
    room: string;
    showtime: Date;
    standardVisitors: number;
    discountedVisitors: number;
    seatNumbers: number[];
}

export class CreateOrderFromBooking implements UseCase<CreateOrderFromBookingInput, string> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(unitOfWork: UnitOfWork, logger: Logger) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: CreateOrderFromBookingInput): Promise<string> {
        this._logger.debug('Creating order from booking', {
            bookingId: input.bookingId,
            movieId: input.movieId,
        });

        return await this._unitOfWork.do(async () => {
            const movieRepository = this._unitOfWork.getRepository<MovieRepository>(Movie.name);
            const movie = await this.loadMovie(movieRepository, input.movieId);

            const order = Order.createFromBooking(
                input.bookingId,
                movie,
                input.room,
                input.showtime,
                input.standardVisitors,
                input.discountedVisitors,
                input.seatNumbers,
            );

            await this._unitOfWork.save(order);

            this._logger.info('Order created from booking', {
                orderId: order.id.value,
                bookingId: input.bookingId,
            });

            return order.id.value;
        });
    }

    private async loadMovie(movieRepository: MovieRepository, movieId: string): Promise<Movie> {
        const existingMovie = await movieRepository.byId(MovieId.create(movieId));
        if (existingMovie.isPresent) {
            return existingMovie.getOrThrow();
        }

        const moviesApiBaseUrl = (Deno.env.get('MOVIES_API_BASE_URL') ?? 'http://movies.howestprime.test:8000')
            .replace(/\/$/, '');
        const response = await fetch(`${moviesApiBaseUrl}/api/movie-catalog/${movieId}`, {
            headers: { 'x-user-role': 'Manager' },
        });

        if (!response.ok) {
            throw new NotFoundDomainException(
                `Movie '${movieId}' not found while creating order from booking.`,
            );
        }

        const payload = await response.json() as {
            id: string;
            title: string;
            duration?: number;
            durationMinutes?: number;
            genres: unknown;
            posterUrl: string;
            ageRating: string;
        };

        const hydratedMovie = Movie.create(
            payload.id,
            payload.title,
            payload.durationMinutes ?? payload.duration ?? 0,
            payload.genres,
            payload.posterUrl,
            payload.ageRating,
        );

        await movieRepository.save(hydratedMovie);

        this._logger.info('Hydrated movie from movies API', { movieId: hydratedMovie.id.value });

        return hydratedMovie;
    }
}
