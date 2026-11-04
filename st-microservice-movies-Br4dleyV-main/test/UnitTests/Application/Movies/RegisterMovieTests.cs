using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging.Abstractions;

namespace UnitTests.Application.Movies;

public sealed class MovieDataTests
{
    private readonly FakeUnitOfWork _fakeUow;
    private readonly RegisterMovie _sut;

    public MovieDataTests()
    {
        _fakeUow = new FakeUnitOfWork();
        _sut = new RegisterMovie(_fakeUow, NullLogger<RegisterMovie>.Instance);
    }

    [Fact]
    public async Task Execute_ValidInput_ReturnsNonEmptyGuid()
    {
        // Arrange
        var input = ValidInput();

        // Act
        var result = await _sut.Execute(input);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Execute_ValidInput_CallsSaveOnUnitOfWork()
    {
        // Arrange
        var input = ValidInput();

        // Act
        await _sut.Execute(input);

        // Assert
        Assert.True(_fakeUow.SaveWasCalled);
    }

    [Fact]
    public async Task Execute_ValidInput_CallsDoOnUnitOfWork()
    {
        // Arrange
        var input = ValidInput();

        // Act
        await _sut.Execute(input);

        // Assert
        Assert.True(_fakeUow.DoWasCalled);
    }

    [Fact]
    public async Task Execute_ValidInput_SavedMovieMatchesInput()
    {
        // Arrange
        var input = ValidInput();

        // Act
        await _sut.Execute(input);

        // Assert
        Assert.NotNull(_fakeUow.SavedAggregate);
        var movie = Assert.IsType<Movie>(_fakeUow.SavedAggregate);
        Assert.Equal(input.Title, movie.Title.Value);
        Assert.Equal(input.Description, movie.Description.Value);
        Assert.Equal(input.Duration, movie.Duration.Value);
        Assert.Equal(input.ReleaseYear, movie.ReleaseYear.Value);
        Assert.Equal(input.AgeRating, movie.AgeRating.Value);
        Assert.Equal(input.PosterUrl, movie.PosterUrl.Value);
    }

    [Fact]
    public async Task Execute_ValidInput_MovieHasCorrectGenres()
    {
        // Arrange
        var input = ValidInput();

        // Act
        await _sut.Execute(input);

        // Assert
        var movie = Assert.IsType<Movie>(_fakeUow.SavedAggregate);
        Assert.Equal(input.Genres.Count(), movie.Genres.Count);
        Assert.Contains(movie.Genres, g => g.Value == "Action");
        Assert.Contains(movie.Genres, g => g.Value == "Drama");
    }

    [Fact]
    public async Task Execute_ValidInput_MovieHasCorrectActors()
    {
        // Arrange
        var input = ValidInput();

        // Act
        await _sut.Execute(input);

        // Assert
        var movie = Assert.IsType<Movie>(_fakeUow.SavedAggregate);
        Assert.Equal(input.Actors.Count(), movie.Actors.Count);
        Assert.Contains(movie.Actors, a => a.Value == "Tom Holland");
    }

    [Fact]
    public async Task Execute_ValidInput_ReturnedGuidMatchesSavedMovieId()
    {
        // Arrange
        var input = ValidInput();

        // Act
        var result = await _sut.Execute(input);

        // Assert
        var movie = Assert.IsType<Movie>(_fakeUow.SavedAggregate);
        Assert.Equal(movie.Id.Value, result);
    }

    [Fact]
    public async Task Execute_WithMultipleGenresAndActors_ReturnsValidGuid()
    {
        // Arrange
        var input = new RegisterMovieInput(
            Title: "The Dark Knight",
            Description: "Batman faces the Joker",
            Duration: 152,
            Genres: ["Action", "Crime", "Drama"],
            ReleaseYear: 2008,
            Actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
            AgeRating: 13,
            PosterUrl: "https://example.com/tdk.jpg"
        );

        // Act
        var result = await _sut.Execute(input);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Execute_WithZeroAgeRating_ReturnsValidGuid()
    {
        // Arrange
        var input = new RegisterMovieInput(
            Title: "Unrated Movie",
            Description: "A movie with no age rating",
            Duration: 90,
            Genres: ["Drama"],
            ReleaseYear: 2020,
            Actors: ["Some Actor"],
            AgeRating: 0,
            PosterUrl: "https://example.com/poster.jpg"
        );

        // Act
        var result = await _sut.Execute(input);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
    }

    private static RegisterMovieInput ValidInput() => new(
        Title: "Inception",
        Description: "A mind-bending thriller",
        Duration: 148,
        Genres: ["Action", "Drama"],
        ReleaseYear: 2010,
        Actors: ["Tom Holland"],
        AgeRating: 13,
        PosterUrl: "https://example.com/inception.jpg"
    );

    // Manual fake — no Moq needed
    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public bool SaveWasCalled { get; private set; }
        public bool DoWasCalled { get; private set; }
        public IAggregateRoot? SavedAggregate { get; private set; }

        public Task Do()
        {
            DoWasCalled = true;
            return Task.CompletedTask;
        }

        public Task Save<TRepository>(IAggregateRoot aggregateRoot) where TRepository : IRepository
        {
            SaveWasCalled = true;
            SavedAggregate = aggregateRoot;
            return Task.CompletedTask;
        }

        public TRepository Repo<TRepository>() where TRepository : IRepository
        {
            throw new NotImplementedException();
        }
    }
}