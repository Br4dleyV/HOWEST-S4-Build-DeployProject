using Aornis;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging.Abstractions;

namespace UnitTests.Application.Movies;

public sealed class ScheduleMovieEventTests
{
    private readonly FakeUnitOfWork _fakeUow;
    private readonly ScheduleMovieEvent _sut;

    private static DateTime ValidShowtime(int hour = 15) =>
        new DateTime(2099, 6, 15, hour, 0, 0);

    public ScheduleMovieEventTests()
    {
        _fakeUow = new FakeUnitOfWork();
        _sut = new ScheduleMovieEvent(_fakeUow, NullLogger<ScheduleMovieEvent>.Instance);
    }

    // ── Happy path: new slot ────────────────────────────────────────────────

    [Fact]
    public async Task Execute_ValidInput_ReturnsNonEmptyGuid()
    {
        var result = await _sut.Execute(ValidInput());
        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Execute_ValidInput_CallsDoOnUnitOfWork()
    {
        await _sut.Execute(ValidInput());
        Assert.True(_fakeUow.DoWasCalled);
    }

    [Fact]
    public async Task Execute_ValidInput_SavesNewMovieEvent()
    {
        var input = ValidInput();
        await _sut.Execute(input);
        Assert.NotNull(_fakeUow.SavedMovieEvent);
        Assert.Equal(input.MovieId, _fakeUow.SavedMovieEvent!.MovieId.Value);
        Assert.Equal(input.RoomId, _fakeUow.SavedMovieEvent.RoomId.Value);
        Assert.Equal(input.Showtime, _fakeUow.SavedMovieEvent.Showtime);
    }

    [Theory]
    [InlineData(15)]
    [InlineData(19)]
    public async Task Execute_ValidShowtimeHour_ReturnsGuid(int hour)
    {
        var result = await _sut.Execute(ValidInput(showtime: ValidShowtime(hour)));
        Assert.NotEqual(Guid.Empty, result);
    }

    // ── Happy path: existing slot is overwritten ────────────────────────────

    [Fact]
    public async Task Execute_ExistingSlot_OverwritesMovieId()
    {
        var showtime = ValidShowtime(15);
        var roomId = Guid.NewGuid();
        var newMovieId = Guid.NewGuid();

        var existingEvent = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(),
            new MovieId(Guid.NewGuid()),
            new RoomId(roomId),
            showtime);
        _fakeUow.MovieEventRepo.ExistingEvent = existingEvent;

        var input = new ScheduleMovieEventInput(newMovieId, roomId, showtime);
        var result = await _sut.Execute(input);

        Assert.NotEqual(Guid.Empty, result);
        Assert.Equal(new MovieId(newMovieId), _fakeUow.SavedMovieEvent!.MovieId);
    }

    // ── Validation: invalid showtime hour ──────────────────────────────────

    [Theory]
    [InlineData(0)]
    [InlineData(14)]
    [InlineData(16)]
    [InlineData(20)]
    [InlineData(23)]
    public async Task Execute_InvalidShowtimeHour_ThrowsArgumentException(int hour)
    {
        var bad = new DateTime(2099, 1, 1, hour, 0, 0);
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.Execute(ValidInput(showtime: bad)));
    }

    // ── Validation: showtime in past ───────────────────────────────────────

    [Fact]
    public async Task Execute_PastShowtime_ThrowsArgumentException()
    {
        var past = DateTime.Now.AddDays(-1);
        var bad = new DateTime(past.Year, past.Month, past.Day, 15, 0, 0);
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.Execute(ValidInput(showtime: bad)));
    }

    // ── Validation: movie not found ────────────────────────────────────────

    [Fact]
    public async Task Execute_MovieNotFound_ThrowsKeyNotFoundException()
    {
        _fakeUow.MovieRepo.MovieExists = false;
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(ValidInput()));
    }

    // ── Validation: room not found ─────────────────────────────────────────

    [Fact]
    public async Task Execute_RoomNotFound_ThrowsKeyNotFoundException()
    {
        _fakeUow.RoomRepo.RoomExists = false;
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(ValidInput()));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private ScheduleMovieEventInput ValidInput(DateTime? showtime = null) =>
        new(
            MovieId: _fakeUow.MovieRepo.KnownMovieId,
            RoomId: _fakeUow.RoomRepo.KnownRoomId,
            Showtime: showtime ?? ValidShowtime(15)
        );

    // ── Fakes ──────────────────────────────────────────────────────────────

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public bool DoWasCalled { get; private set; }
        public MovieEvent? SavedMovieEvent => MovieEventRepo.SavedEvent;

        public FakeMovieRepository MovieRepo { get; } = new();
        public FakeRoomRepository RoomRepo { get; } = new();
        public FakeMovieEventRepository MovieEventRepo { get; } = new();

        public Task Do() { DoWasCalled = true; return Task.CompletedTask; }
        public Task Save<TRepository>(IAggregateRoot aggregateRoot) where TRepository : IRepository => Task.CompletedTask;

        public TRepository Repo<TRepository>() where TRepository : IRepository
        {
            if (typeof(TRepository) == typeof(IMovieRepository)) return (TRepository)(IRepository)MovieRepo;
            if (typeof(TRepository) == typeof(IRoomRepository))  return (TRepository)(IRepository)RoomRepo;
            if (typeof(TRepository) == typeof(IMovieEventRepository)) return (TRepository)(IRepository)MovieEventRepo;
            throw new NotImplementedException($"No fake for {typeof(TRepository).Name}");
        }
    }

    private sealed class FakeMovieRepository : IMovieRepository
    {
        public Guid KnownMovieId { get; } = Guid.NewGuid();
        public bool MovieExists { get; set; } = true;

        public Task<bool> Exists(MovieId id) => Task.FromResult(MovieExists);
        public Task<Optional<Movie>> ById(MovieId id) => Task.FromResult(Optional.Of<Movie>(null));
        public Task Save(Movie a) => Task.CompletedTask;
        public Task Remove(Movie a) => Task.CompletedTask;
        public Task AddAsync(Movie movie, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task ChangeDetailsAsync(MovieId movieId, Movie movieDetails) => Task.CompletedTask;
    }

    private sealed class FakeRoomRepository : IRoomRepository
    {
        public Guid KnownRoomId { get; } = Guid.NewGuid();
        public bool RoomExists { get; set; } = true;

        public Task<bool> Exists(RoomId id) => Task.FromResult(RoomExists);
        public Task<Aornis.Optional<Room>> ById(RoomId id) => throw new NotImplementedException();
        public Task Save(Room a) => Task.CompletedTask;
        public Task Remove(Room a) => Task.CompletedTask;
    }

    private sealed class FakeMovieEventRepository : IMovieEventRepository
    {
        public MovieEvent? ExistingEvent { get; set; }
        public MovieEvent? SavedEvent { get; private set; }

        public Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId)
            => Task.FromResult(ExistingEvent);
        public Task<MovieEvent?> ByBookingId(BookingId bookingId) => Task.FromResult<MovieEvent?>(null);

        public Task<bool> Exists(MovieEventId id) => Task.FromResult(false);
        public Task<Aornis.Optional<MovieEvent>> ById(MovieEventId id) => throw new NotImplementedException();
        public Task Save(MovieEvent a) { SavedEvent = a; return Task.CompletedTask; }
        public Task Remove(MovieEvent a) => Task.CompletedTask;
        public Task<bool> ExistsForMovie(MovieId movieId) => Task.FromResult(false);
    }
}
