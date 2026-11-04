using Aornis;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Movies.Events;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging.Abstractions;

namespace UnitTests.Application.Movies;

public sealed class ChangeMovieDetailsTests
{
    private readonly FakeUnitOfWork _fakeUow;
    private readonly ChangeMovieDetails _sut;

    public ChangeMovieDetailsTests()
    {
        _fakeUow = new FakeUnitOfWork();
        _sut = new ChangeMovieDetails(_fakeUow, NullLogger<ChangeMovieDetails>.Instance);
    }

    [Fact]
    public async Task Execute_ValidInput_UpdatesMovieAndSavesIt()
    {
        var input = ValidInput();

        var result = await _sut.Execute(input);

        Assert.Equal(input.MovieId, result);
        Assert.True(_fakeUow.SaveWasCalled);
        Assert.True(_fakeUow.DoWasCalled);

        var movie = Assert.IsType<Movie>(_fakeUow.SavedAggregate);
        Assert.Equal(input.Title, movie.Title.Value);
        Assert.Equal(input.Description, movie.Description.Value);
        Assert.Equal(input.Duration, movie.Duration.Value);
        Assert.Equal(input.ReleaseYear, movie.ReleaseYear.Value);
        Assert.Equal(input.AgeRating, movie.AgeRating.Value);
        Assert.Equal(input.PosterUrl, movie.PosterUrl.Value);
        Assert.Equal(input.Genres.Count(), movie.Genres.Count);
        Assert.Equal(input.Actors.Count(), movie.Actors.Count);
        Assert.Contains(movie.DomainEvents, e => e is MovieDetailsChanged changed && changed.MovieId.Equals(movie.Id));
    }

    [Fact]
    public async Task Execute_MovieNotFound_ThrowsKeyNotFoundException()
    {
        _fakeUow.MovieExists = false;

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(ValidInput()));
    }

    [Fact]
    public async Task Execute_MovieHasExistingEvents_ThrowsInvalidOperationException()
    {
        _fakeUow.MovieEventRepo.HasEvents = true;

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.Execute(ValidInput()));

        Assert.False(_fakeUow.SaveWasCalled);
        Assert.False(_fakeUow.DoWasCalled);
    }

    private ChangeMovieDetailsInput ValidInput() => new(
        MovieId: _fakeUow.MovieRepo.KnownMovieId,
        Title: "Updated Title",
        Description: "Updated Description",
        Duration: 140,
        Genres: ["Sci-Fi", "Thriller"],
        ReleaseYear: 2024,
        Actors: ["Jane Doe", "John Smith"],
        AgeRating: 16,
        PosterUrl: "https://example.com/updated.jpg"
    );

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public bool SaveWasCalled { get; private set; }
        public bool DoWasCalled { get; private set; }
        public bool MovieExists { get; set; } = true;
        public IAggregateRoot? SavedAggregate { get; private set; }
        public FakeMovieRepository MovieRepo { get; } = new();
        public FakeMovieEventRepository MovieEventRepo { get; } = new();

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
            if (typeof(TRepository) == typeof(IMovieRepository))
            {
                MovieRepo.MovieExists = MovieExists;
                return (TRepository)(IRepository)MovieRepo;
            }
            if (typeof(TRepository) == typeof(IMovieEventRepository))
            {
                return (TRepository)(IRepository)MovieEventRepo;
            }
            throw new NotImplementedException($"No fake for {typeof(TRepository).Name}");
        }
    }

    private sealed class FakeMovieRepository : IMovieRepository
    {
        public bool MovieExists { get; set; } = true;
        public Guid KnownMovieId => _movie.Id.Value;
        private readonly Movie _movie = Movie.Register(
            new MovieId(Guid.NewGuid()),
            Title.Create("Original Title"),
            Description.Create("Original Description"),
            Duration.Create(120),
            ReleaseYear.Create(2020),
            AgeRating.Create(13),
            PosterUrl.Create("https://example.com/original.jpg"),
            [Genre.Create("Drama")],
            [Actor.Create("Original Actor")]
        );

        public Task<bool> Exists(MovieId id) => Task.FromResult(MovieExists);

        public Task<Optional<Movie>> ById(MovieId id)
        {
            return Task.FromResult(MovieExists ? Optional.Of(_movie) : Optional.Of<Movie>(null));
        }

        public Task Save(Movie aggregateRoot) => Task.CompletedTask;

        public Task Remove(Movie aggregateRoot) => Task.CompletedTask;

        public Task AddAsync(Movie movie, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task ChangeDetailsAsync(MovieId movieId, Movie movieDetails) => Task.CompletedTask;
    }

    private sealed class FakeMovieEventRepository : IMovieEventRepository
    {
        public bool HasEvents { get; set; }

        public Task<bool> ExistsForMovie(MovieId movieId) => Task.FromResult(HasEvents);

        public Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId) => Task.FromResult<MovieEvent?>(null);

        public Task<MovieEvent?> ByBookingId(BookingId bookingId) => Task.FromResult<MovieEvent?>(null);

        public Task<bool> Exists(MovieEventId id) => Task.FromResult(false);

        public Task<Optional<MovieEvent>> ById(MovieEventId id) => Task.FromResult(Optional.Of<MovieEvent>(null));

        public Task Save(MovieEvent aggregateRoot) => Task.CompletedTask;

        public Task Remove(MovieEvent aggregateRoot) => Task.CompletedTask;
    }
}
