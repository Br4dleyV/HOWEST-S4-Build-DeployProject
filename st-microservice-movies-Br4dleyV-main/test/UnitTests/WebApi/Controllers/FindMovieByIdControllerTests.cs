using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.WebApi.Controllers;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq.Expressions;

namespace UnitTests.WebApi.Controllers;

public sealed class FindMovieByIdControllerTests
{
    [Fact]
    public async Task Invoke_ReturnsUpcomingShowtimesForMovieDetails()
    {
        var movieId = Guid.NewGuid();
        var showtime1 = DateTime.UtcNow.AddDays(1).Date.AddHours(18);
        var showtime2 = DateTime.UtcNow.AddDays(2).Date.AddHours(20);
        var pastShowtime = DateTime.UtcNow.AddDays(-1).Date.AddHours(18);

        var movie = new MovieData
        {
            Id = movieId,
            Title = "Spider-Man: No Way Home",
            Description = "Spider-Man!!!",
            Duration = 148,
            ReleaseYear = 2021,
            AgeRating = 13,
            PosterUrl = "https://example.com/poster.jpg",
            Genres = [new GenreData { Value = "Sci-Fi" }, new GenreData { Value = "Thriller" }],
            Actors = [new ActorData { Value = "Leonardo DiCaprio" }, new ActorData { Value = "Joseph Gordon-Levitt" }]
        };

        var useCase = new FakeFindMovieByIdUseCase(movie);
        var movieEventQuery = new FakeMovieEventQuery(
            [
                new MovieEventData { Id = Guid.NewGuid(), MovieId = movieId, Showtime = showtime2 },
                new MovieEventData { Id = Guid.NewGuid(), MovieId = movieId, Showtime = pastShowtime },
                new MovieEventData { Id = Guid.NewGuid(), MovieId = movieId, Showtime = showtime1 }
            ]
        );

        var request = new FindMovieByIdRequest(movieId, "Manager", useCase, movieEventQuery);

        var result = await FindMovieByIdController.Invoke(request);

        var valueProperty = result.GetType().GetProperty("Value");
        Assert.NotNull(valueProperty);

        var responseMovie = Assert.IsType<Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses.Movie>(
            valueProperty!.GetValue(result)
        );

        Assert.Equal(movieId, responseMovie.Id);
        Assert.Equal([showtime1, showtime2], responseMovie.Showtimes);
    }

    private sealed class FakeFindMovieByIdUseCase(MovieData movie) : IUseCase<FindMovieByIdInput, MovieData>
    {
        public Task<MovieData> Execute(FindMovieByIdInput input)
        {
            return Task.FromResult(movie);
        }
    }

    private sealed class FakeMovieEventQuery(IEnumerable<MovieEventData> movieEvents) : IMovieEventQuery
    {
        public Task<IReadOnlyList<MovieEventData>> Fetch(Expression<Func<MovieEventData, bool>> filter)
        {
            var compiled = filter.Compile();
            IReadOnlyList<MovieEventData> result = movieEvents.Where(compiled).ToList();
            return Task.FromResult(result);
        }
    }
}