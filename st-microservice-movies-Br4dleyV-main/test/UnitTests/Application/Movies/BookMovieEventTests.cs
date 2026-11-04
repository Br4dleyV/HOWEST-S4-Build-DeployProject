using Aornis;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging.Abstractions;

namespace UnitTests.Application.Movies;

public sealed class BookMovieEventTests
{
    private readonly FakeUnitOfWork _fakeUow;
    private readonly BookMovieEvent _sut;

    public BookMovieEventTests()
    {
        _fakeUow = new FakeUnitOfWork();
        _sut = new BookMovieEvent(_fakeUow, NullLogger<BookMovieEvent>.Instance);
    }

    [Fact]
    public async Task Execute_ValidInput_ReturnsNonEmptyBookingId()
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
    public async Task Execute_ValidInput_SavesUpdatedMovieEvent()
    {
        await _sut.Execute(ValidInput());
        Assert.NotNull(_fakeUow.MovieEventRepo.SavedEvent);
    }

    [Fact]
    public async Task Execute_ValidInput_BookingAppearsOnMovieEvent()
    {
        await _sut.Execute(ValidInput());
        Assert.Single(_fakeUow.MovieEventRepo.SavedEvent!.Bookings);
    }

    [Fact]
    public async Task Execute_ValidInput_VisitorsIncreasedOnEvent()
    {
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 2, 1);
        await _sut.Execute(input);
        Assert.Equal(3, _fakeUow.MovieEventRepo.SavedEvent!.Visitors);
    }

    [Fact]
    public async Task Execute_ValidInput_RaisesBookingOpenedDomainEvent()
    {
        await _sut.Execute(ValidInput());
        var saved = _fakeUow.MovieEventRepo.SavedEvent!;
        Assert.Contains(saved.DomainEvents, e => e is BookingOpened);
    }

    [Fact]
    public async Task Execute_StandardVisitorsOnly_Works()
    {
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 5, 0);
        Assert.NotEqual(Guid.Empty, await _sut.Execute(input));
    }

    [Fact]
    public async Task Execute_DiscountVisitorsOnly_Works()
    {
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 0, 3);
        Assert.NotEqual(Guid.Empty, await _sut.Execute(input));
    }

    [Fact]
    public async Task Execute_MovieEventNotFound_ThrowsKeyNotFoundException()
    {
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _sut.Execute(new BookMovieEventInput(Guid.NewGuid(), 1, 0)));
    }

    [Fact]
    public async Task Execute_RoomNotFound_ThrowsKeyNotFoundException()
    {
        _fakeUow.RoomRepo.RoomExists = false;
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(ValidInput()));
    }

    [Fact]
    public async Task Execute_ZeroVisitors_ThrowsArgumentException()
    {
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 0, 0);
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.Execute(input));
    }

    [Fact]
    public async Task Execute_ExceedsRoomCapacity_ThrowsArgumentException()
    {
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 60, 41);
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.Execute(input));
    }

    [Fact]
    public async Task Execute_EventBeyond14Days_ThrowsArgumentException()
    {
        _fakeUow.MovieEventRepo.UseDistantFutureEvent = true;
        var input = new BookMovieEventInput(_fakeUow.MovieEventRepo.DistantEvent.Id.Value, 1, 0);
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.Execute(input));
    }

    private BookMovieEventInput ValidInput() =>
        new(_fakeUow.MovieEventRepo.KnownEvent.Id.Value, 2, 1);

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public bool DoWasCalled { get; private set; }
        public FakeMovieEventRepository MovieEventRepo { get; } = new();
        public FakeRoomRepository RoomRepo { get; } = new();

        public Task Do() { DoWasCalled = true; return Task.CompletedTask; }
        public Task Save<TRepository>(IAggregateRoot aggregateRoot) where TRepository : IRepository
            => Task.CompletedTask;

        public TRepository Repo<TRepository>() where TRepository : IRepository
        {
            if (typeof(TRepository) == typeof(IMovieEventRepository))
                return (TRepository)(IRepository)MovieEventRepo;
            if (typeof(TRepository) == typeof(IRoomRepository))
                return (TRepository)(IRepository)RoomRepo;
            throw new NotImplementedException($"No fake for {typeof(TRepository).Name}");
        }
    }

    private sealed class FakeMovieEventRepository : IMovieEventRepository
    {
        private static readonly MovieId SomeMovieId = new(Guid.NewGuid());
        private static readonly RoomId SomeRoomId = new(Guid.NewGuid());

        public MovieEvent KnownEvent { get; } =
            MovieEvent.Schedule(
                EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId,
                DateTime.Now.AddDays(1).Date.AddHours(15));

        public MovieEvent DistantEvent { get; } =
            MovieEvent.Schedule(
                EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId,
                DateTime.Now.AddDays(20).Date.AddHours(15));

        public bool UseDistantFutureEvent { get; set; }
        public MovieEvent? SavedEvent { get; private set; }

        public Task<Optional<MovieEvent>> ById(MovieEventId id)
        {
            if (!UseDistantFutureEvent && id == KnownEvent.Id)
                return Task.FromResult(Optional.Of<MovieEvent>(KnownEvent));
            if (UseDistantFutureEvent && id == DistantEvent.Id)
                return Task.FromResult(Optional.Of<MovieEvent>(DistantEvent));
            return Task.FromResult(Optional.Of<MovieEvent>(null));
        }

        public Task<bool> Exists(MovieEventId id) => Task.FromResult(id == KnownEvent.Id);
        public Task Save(MovieEvent a) { SavedEvent = a; return Task.CompletedTask; }
        public Task Remove(MovieEvent a) => Task.CompletedTask;
        public Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId)
            => Task.FromResult<MovieEvent?>(null);
        public Task<MovieEvent?> ByBookingId(BookingId bookingId) => Task.FromResult<MovieEvent?>(null);
        public Task<bool> ExistsForMovie(MovieId movieId) => Task.FromResult(false);
    }

    private sealed class FakeRoomRepository : IRoomRepository
    {
        public bool RoomExists { get; set; } = true;
        private readonly Room _room = Room.Create("Blue Room", 100, EntityId.New<RoomId>());

        public Task<Optional<Room>> ById(RoomId id)
            => Task.FromResult(RoomExists ? Optional.Of<Room>(_room) : Optional.Of<Room>(null));

        public Task<bool> Exists(RoomId id) => Task.FromResult(RoomExists);
        public Task Save(Room a) => Task.CompletedTask;
        public Task Remove(Room a) => Task.CompletedTask;
    }
}
