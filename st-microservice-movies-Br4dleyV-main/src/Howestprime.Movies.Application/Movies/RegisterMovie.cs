using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record RegisterMovieInput(
    string Title,
    string Description,
    int Duration,
    IEnumerable<string> Genres,
    int ReleaseYear,
    IEnumerable<string> Actors,
    int AgeRating,
    string PosterUrl
);

public sealed class RegisterMovie(
    IUnitOfWork uow,
    ILogger<RegisterMovie> logger
) : IUseCase<RegisterMovieInput, Guid>
{
    public async Task<Guid> Execute(RegisterMovieInput input)
    {
        var genres = input.Genres.Select(Genre.Create);
        var actors = input.Actors.Select(Actor.Create);

        Movie movie = Movie.Register(
            new MovieId(Guid.NewGuid()),
            Title.Create(input.Title),
            Description.Create(input.Description),
            Duration.Create(input.Duration),
            ReleaseYear.Create(input.ReleaseYear),
            AgeRating.Create(input.AgeRating),
            PosterUrl.Create(input.PosterUrl),
            genres,
            actors
        );

        await uow.Save<IMovieRepository>(movie);

        await uow.Do();

        logger.LogInformation($"Movie with ID {movie.Id.Value} has been registered.");

        return movie.Id.Value;
    }
}
