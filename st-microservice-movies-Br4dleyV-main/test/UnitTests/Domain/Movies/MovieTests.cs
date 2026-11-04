using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.Events;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Movies;

public sealed class MovieTests
{
    [Fact]
    public void Create_WithValidInput_ShouldInitializeStateAndRaiseEvent()
    {
        // Arrange
        MovieId movieId = EntityId.New<MovieId>();

        // Act
        Movie movie = Movie.Register(movieId, Title.Create("Spider-Man: Brand New Day"), Description.Create("The best movie releasing in 2026."), Duration.Create(120), ReleaseYear.Create(2026), AgeRating.Create(13), PosterUrl.Create("https://cdn.marvel.com/content/2x/smbnd_online_1400x2100_reflection_03.jpg"), [Genre.Create("Superhero")], [Actor.Create("Tom Holland")]);

        // Assert
        Assert.Equal(Title.Create("Spider-Man: Brand New Day"), movie.Title);
        Assert.Equal(movieId, movie.Id);
        Assert.Equal(Description.Create("The best movie releasing in 2026."), movie.Description);
        Assert.Equal(Duration.Create(120), movie.Duration);
        Assert.Equal(ReleaseYear.Create(2026), movie.ReleaseYear);
        Assert.Equal(AgeRating.Create(13), movie.AgeRating);
        Assert.Equal(PosterUrl.Create("https://cdn.marvel.com/content/2x/smbnd_online_1400x2100_reflection_03.jpg"), movie.PosterUrl);
        Assert.Contains(Genre.Create("Superhero"), movie.Genres);
        Assert.Contains(Actor.Create("Tom Holland"), movie.Actors);

        Assert.Contains(
            movie.DomainEvents,
            e => e is MovieRegistered registered &&
                 registered.MovieId.Equals(movie.Id)
        );

        movie.ValidateState();
    }

    [Fact]
    public void Register_WithEmptyGenresAndActors_ShouldInitializeEmptyCollections()
    {
        // Arrange
        MovieId movieId = EntityId.New<MovieId>();

        // Act
        Movie movie = Movie.Register(
            movieId,
            Title.Create("A Quiet Movie"),
            Description.Create("No actors, no genres."),
            Duration.Create(90),
            ReleaseYear.Create(DateTime.Now.Year - 1),
            AgeRating.Create(13),
            PosterUrl.Create("https://example.com/quiet.jpg"),
            [],
            []);

        // Assert
        Assert.Empty(movie.Genres);
        Assert.Empty(movie.Actors);
        Assert.Contains(
            movie.DomainEvents,
            e => e is MovieRegistered registered &&
                 registered.MovieId.Equals(movie.Id)
        );
    }

    [Fact]
    public void ChangeDetails_WithValidInput_ShouldUpdateStateAndRaiseEvent()
    {
        // Arrange
        Movie movie = Movie.Register(
            EntityId.New<MovieId>(),
            Title.Create("Original Title"),
            Description.Create("Original Description"),
            Duration.Create(120),
            ReleaseYear.Create(2020),
            AgeRating.Create(13),
            PosterUrl.Create("https://example.com/original.jpg"),
            [Genre.Create("Drama")],
            [Actor.Create("Original Actor")]
        );

        // Act
        movie.ChangeDetails(
            Title.Create("Updated Title"),
            Description.Create("Updated Description"),
            Duration.Create(140),
            ReleaseYear.Create(2024),
            AgeRating.Create(16),
            PosterUrl.Create("https://example.com/updated.jpg"),
            [Genre.Create("Sci-Fi"), Genre.Create("Thriller")],
            [Actor.Create("Jane Doe"), Actor.Create("John Smith")]
        );

        // Assert
        Assert.Equal(Title.Create("Updated Title"), movie.Title);
        Assert.Equal(Description.Create("Updated Description"), movie.Description);
        Assert.Equal(Duration.Create(140), movie.Duration);
        Assert.Equal(ReleaseYear.Create(2024), movie.ReleaseYear);
        Assert.Equal(AgeRating.Create(16), movie.AgeRating);
        Assert.Equal(PosterUrl.Create("https://example.com/updated.jpg"), movie.PosterUrl);
        Assert.Contains(movie.Genres, g => g.Value == "Sci-Fi");
        Assert.Contains(movie.Genres, g => g.Value == "Thriller");
        Assert.Contains(movie.Actors, a => a.Value == "Jane Doe");
        Assert.Contains(movie.Actors, a => a.Value == "John Smith");
        Assert.Contains(movie.DomainEvents, e => e is MovieDetailsChanged);
    }
}