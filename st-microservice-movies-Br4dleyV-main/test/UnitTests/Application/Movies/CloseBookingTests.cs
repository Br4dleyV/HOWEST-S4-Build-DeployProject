using Aornis;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging.Abstractions;

namespace UnitTests.Application.Movies;

public sealed class CloseBookingTests
{
    private readonly CloseBooking _sut;

    public CloseBookingTests()
    {
        _sut = new CloseBooking(new FakeUnitOfWork(), NullLogger<CloseBooking>.Instance);
    }

    private static MovieEvent CreateEventWithBooking(int standardVisitors, int discountVisitors, out Guid bookingId)
    {
        var movieEvent = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(), 
            new MovieId(Guid.NewGuid()), 
            new RoomId(Guid.NewGuid()),
            DateTime.Now.AddDays(1).Date.AddHours(15));

        var bid = EntityId.New<BookingId>();
        bookingId = bid.Value;
        movieEvent.Book(bid, standardVisitors, discountVisitors, 100, "Test Room");

        return movieEvent;
    }

    [Fact]
    public async Task Execute_PaymentSuccess_ClosesBooking()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentSuccess);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        var booking = fakeUow.SavedEvent!.Bookings.First(b => b.Id == new BookingId(bookingId));
        Assert.Equal(BookingStatus.Closed, booking.BookingStatus);
    }

    [Fact]
    public async Task Execute_PaymentSuccess_SetsPaidStatus()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentSuccess);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        var booking = fakeUow.SavedEvent!.Bookings.First(b => b.Id == new BookingId(bookingId));
        Assert.Equal(PaymentStatus.Paid, booking.PaymentStatus);
    }

    [Fact]
    public async Task Execute_PaymentSuccess_KeepsVisitorCount()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var visitorsAfterBooking = movieEvent.Visitors;
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentSuccess);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        Assert.Equal(visitorsAfterBooking, fakeUow.SavedEvent!.Visitors);
    }

    [Fact]
    public async Task Execute_PaymentFailed_ClosesBooking()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentFailed);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        var booking = fakeUow.SavedEvent!.Bookings.First(b => b.Id == new BookingId(bookingId));
        Assert.Equal(BookingStatus.Closed, booking.BookingStatus);
    }

    [Fact]
    public async Task Execute_PaymentFailed_SetsFailedStatus()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentFailed);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        var booking = fakeUow.SavedEvent!.Bookings.First(b => b.Id == new BookingId(bookingId));
        Assert.Equal(PaymentStatus.Failed, booking.PaymentStatus);
    }

    [Fact]
    public async Task Execute_PaymentFailed_ReleasesSeats()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentFailed);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        var booking = fakeUow.SavedEvent!.Bookings.First(b => b.Id == new BookingId(bookingId));
        Assert.Empty(booking.SeatNumbers);
    }

    [Fact]
    public async Task Execute_PaymentFailed_DecreasesVisitors()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out var bookingId);
        var visitorsAfterBooking = movieEvent.Visitors;
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentFailed);

        await sut.Execute(input);

        Assert.NotNull(fakeUow.SavedEvent);
        Assert.True(fakeUow.SavedEvent!.Visitors < visitorsAfterBooking);
    }

    [Fact]
    public async Task Execute_BookingNotFound_ThrowsKeyNotFoundException()
    {
        var movieEvent = CreateEventWithBooking(2, 1, out _);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var unknownBookingId = Guid.NewGuid();
        var input = new CloseBookingInput(unknownBookingId, CloseBookingReason.PaymentSuccess);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => sut.Execute(input));
    }

    [Fact]
    public async Task Execute_CallsUnitOfWorkDo()
    {
        var movieEvent = CreateEventWithBooking(1, 0, out var bookingId);
        var fakeUow = new FakeUnitOfWork { Event = movieEvent };
        var sut = new CloseBooking(fakeUow, NullLogger<CloseBooking>.Instance);
        var input = new CloseBookingInput(bookingId, CloseBookingReason.PaymentSuccess);

        await sut.Execute(input);

        Assert.True(fakeUow.DoWasCalled);
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public MovieEvent Event { get; set; } = null!;
        public MovieEvent? SavedEvent { get; set; }
        public bool DoWasCalled { get; set; }

        public Task Do() { DoWasCalled = true; return Task.CompletedTask; }
        public Task Save<TRepository>(IAggregateRoot aggregateRoot) where TRepository : IRepository
            => Task.CompletedTask;

        public TRepository Repo<TRepository>() where TRepository : IRepository
        {
            if (typeof(TRepository) == typeof(IMovieEventRepository))
                return (TRepository)(IRepository)new FakeMovieEventRepository(this);
            throw new NotImplementedException();
        }
    }

    private sealed class FakeMovieEventRepository : IMovieEventRepository
    {
        private readonly FakeUnitOfWork _uow;

        public FakeMovieEventRepository(FakeUnitOfWork uow)
        {
            _uow = uow;
        }

        public Task<Optional<MovieEvent>> ById(MovieEventId id)
            => Task.FromResult(Optional.Of<MovieEvent>(_uow.Event));

        public Task<bool> Exists(MovieEventId id) => Task.FromResult(true);

        public Task Save(MovieEvent evt)
        {
            _uow.SavedEvent = evt;
            return Task.CompletedTask;
        }

        public Task Remove(MovieEvent a) => Task.CompletedTask;

        public Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId)
            => Task.FromResult<MovieEvent?>(null);

        public Task<MovieEvent?> ByBookingId(BookingId bookingId)
            => Task.FromResult<MovieEvent?>(_uow.Event);

        public Task<bool> ExistsForMovie(MovieId movieId) => Task.FromResult(false);
    }
}
