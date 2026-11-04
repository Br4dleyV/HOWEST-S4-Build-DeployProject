using System.Text.Json;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.Events;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

namespace UnitTests.Infrastructure;

public class MovieRegisteredMessageTests
{
    [Fact]
    public void RegisteredMovieMessageContainsTheSnapshotRequiredByTicketing()
    {
        var id = new MovieId(Guid.NewGuid());
        var movie = Movie.Register(
            id, Title.Create("Portfolio film"), Description.Create("Example film"),
            Duration.Create(100), ReleaseYear.Create(2026), AgeRating.Create(13),
            PosterUrl.Create("https://example.com/poster.jpg"),
            [Genre.Create("Drama")], [Actor.Create("Test Actor")]);
        var registered = Assert.IsType<MovieRegistered>(Assert.Single(movie.DomainEvents));

        // Later edits must not change the data of the already-raised event.
        movie.ChangeDetails(
            Title.Create("Edited film"), movie.Description, Duration.Create(120),
            movie.ReleaseYear, movie.AgeRating, movie.PosterUrl,
            [Genre.Create("Thriller")], movie.Actors.ToArray());

        using var document = JsonDocument.Parse(AmqpMessageConverter.Serialize(registered));
        var payload = document.RootElement;
        Assert.Equal(id.Value.ToString(), payload.GetProperty("movieId").GetString());
        Assert.Equal("Portfolio film", payload.GetProperty("title").GetString());
        Assert.Equal(100, payload.GetProperty("durationMinutes").GetInt32());
        Assert.Equal("Drama", payload.GetProperty("genres")[0].GetString());
        Assert.Equal("13", payload.GetProperty("ageRating").GetString());
        Assert.Equal("https://example.com/poster.jpg", payload.GetProperty("posterUrl").GetString());
    }
}
