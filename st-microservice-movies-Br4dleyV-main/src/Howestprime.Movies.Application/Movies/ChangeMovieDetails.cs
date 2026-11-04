using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record ChangeMovieDetailsInput(
    Guid MovieId,
    string Title,
    string Description,
    int Duration,
    IEnumerable<string> Genres,
    int ReleaseYear,
    IEnumerable<string> Actors,
    int AgeRating,
    string PosterUrl
);

public sealed class ChangeMovieDetails(
    IUnitOfWork uow,
    ILogger<ChangeMovieDetails> logger
) : IUseCase<ChangeMovieDetailsInput, Guid>
{
    public async Task<Guid> Execute(ChangeMovieDetailsInput input)
    {
        // Validate input
        MovieId movieId = new(input.MovieId);
        Title title = Title.Create(input.Title);
        Description description = Description.Create(input.Description);
        Duration duration = Duration.Create(input.Duration);
        ReleaseYear releaseYear = ReleaseYear.Create(input.ReleaseYear);
        AgeRating ageRating = AgeRating.Create(input.AgeRating);
        PosterUrl posterUrl = PosterUrl.Create(input.PosterUrl);
        var genres = input.Genres.Select(Genre.Create).ToList();
        var actors = input.Actors.Select(Actor.Create).ToList();

        // Update movie details in database
        IMovieRepository movieRepository = uow.Repo<IMovieRepository>();
        var maybeMovie = await movieRepository.ById(movieId);
        if (!maybeMovie.HasValue)
            throw new KeyNotFoundException($"Movie with id '{input.MovieId}' was not found.");

        var hasEvents = await uow.Repo<IMovieEventRepository>().ExistsForMovie(movieId);
        if (hasEvents)
            throw new InvalidOperationException("Movie details cannot be changed because there are already events associated with this movie.");

        // Emit MovieDetailsChanged event after changing details
        Movie movie = maybeMovie.Value;
        movie.ChangeDetails(title, description, duration, releaseYear, ageRating, posterUrl, genres, actors);
        await uow.Save<IMovieRepository>(movie);
        await uow.Do();

        return movie.Id.Value;
    }
}
