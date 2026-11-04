using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.MovieEvents;

public sealed class BookingTests
{
    private static readonly MovieId SomeMovieId = new(Guid.NewGuid());
    private static readonly RoomId SomeRoomId = new(Guid.NewGuid());

    private static MovieEvent FutureEvent() => MovieEvent.Schedule(
        EntityId.New<MovieEventId>(),
        SomeMovieId,
        SomeRoomId,
        DateTime.Now.AddDays(1).Date.AddHours(15));

    [Fact]
    public void Book_ValidInput_ReturnsBookingWithOpenStatus()
    {
        var ev = FutureEvent();
        var booking = ev.Book(EntityId.New<BookingId>(), 2, 1, 100, "Blue Room");

        Assert.Equal(BookingStatus.Open, booking.BookingStatus);
        Assert.Equal(PaymentStatus.Pending, booking.PaymentStatus);
        Assert.Equal(2, booking.StandardVisitors);
        Assert.Equal(1, booking.DiscountVisitors);
    }

    [Fact]
    public void Book_ValidInput_SeatNumbersAreSequentialFromOne()
    {
        var ev = FutureEvent();
        var booking = ev.Book(EntityId.New<BookingId>(), 2, 1, 100, "Blue Room");

        Assert.Equal([1, 2, 3], booking.SeatNumbers);
    }

    [Fact]
    public void Book_TwoBookings_SeatNumbersContinueSequentially()
    {
        var ev = FutureEvent();
        ev.Book(EntityId.New<BookingId>(), 2, 0, 100, "Blue Room");
        var second = ev.Book(EntityId.New<BookingId>(), 1, 1, 100, "Blue Room");

        Assert.Equal([3, 4], second.SeatNumbers);
    }

    [Fact]
    public void Book_ValidInput_VisitorsCountIncremented()
    {
        var ev = FutureEvent();
        ev.Book(EntityId.New<BookingId>(), 2, 1, 100, "Blue Room");
        Assert.Equal(3, ev.Visitors);
    }

    [Fact]
    public void Book_ValidInput_BookingAddedToList()
    {
        var ev = FutureEvent();
        ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room");
        Assert.Single(ev.Bookings);
    }

    [Fact]
    public void Book_ValidInput_RaisesBookingOpenedEvent()
    {
        var ev = FutureEvent();
        ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room");

        Assert.Single(ev.DomainEvents);
        Assert.IsType<BookingOpened>(ev.DomainEvents.First());
    }

    [Fact]
    public void Book_ValidInput_BookingOpenedEventHasCorrectData()
    {
        var ev = FutureEvent();
        var bookingId = EntityId.New<BookingId>();
        ev.Book(bookingId, 2, 1, 100, "Blue Room");

        var @event = (BookingOpened)ev.DomainEvents.First();
        Assert.Equal(bookingId, @event.BookingId);
        Assert.Equal(SomeMovieId.Value, @event.MovieId);
        Assert.Equal("Blue Room", @event.Room);
        Assert.Equal(2, @event.StandardVisitors);
        Assert.Equal(1, @event.DiscountedVisitors);
        Assert.Equal([1, 2, 3], @event.SeatNumbers);
    }

    [Fact]
    public void Book_ZeroVisitors_ThrowsArgumentException()
    {
        var ev = FutureEvent();
        Assert.Throws<ArgumentException>(() =>
            ev.Book(EntityId.New<BookingId>(), 0, 0, 100, "Blue Room"));
    }

    [Fact]
    public void Book_ExceedsCapacity_ThrowsArgumentException()
    {
        var ev = FutureEvent();
        Assert.Throws<ArgumentException>(() =>
            ev.Book(EntityId.New<BookingId>(), 5, 0, 3, "Blue Room"));
    }

    [Fact]
    public void Book_SecondBookingExceedsCapacity_ThrowsArgumentException()
    {
        var ev = FutureEvent();
        ev.Book(EntityId.New<BookingId>(), 3, 0, 5, "Blue Room");
        Assert.Throws<ArgumentException>(() =>
            ev.Book(EntityId.New<BookingId>(), 3, 0, 5, "Blue Room"));
    }

    [Fact]
    public void Book_ShowtimeOutside14Days_ThrowsArgumentException()
    {
        var farFuture = DateTime.Now.AddDays(20).Date.AddHours(15);
        var ev = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(),
            SomeMovieId,
            SomeRoomId,
            farFuture);

        Assert.Throws<ArgumentException>(() =>
            ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room"));
    }

    [Fact]
    public void Close_PaymentSuccess_SetsStatusPaidAndClosed()
    {
        var ev = FutureEvent();
        var booking = ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room");
        booking.Close(CloseBookingReason.PaymentSuccess);

        Assert.Equal(BookingStatus.Closed, booking.BookingStatus);
        Assert.Equal(PaymentStatus.Paid, booking.PaymentStatus);
    }

    [Fact]
    public void Close_PaymentFailed_SetsStatusFailedAndClosed()
    {
        var ev = FutureEvent();
        var booking = ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room");
        booking.Close(CloseBookingReason.PaymentFailed);

        Assert.Equal(BookingStatus.Closed, booking.BookingStatus);
        Assert.Equal(PaymentStatus.Failed, booking.PaymentStatus);
    }

    [Fact]
    public void Booking_ValidateState_DoesNotThrow()
    {
        var ev = FutureEvent();
        var booking = ev.Book(EntityId.New<BookingId>(), 1, 0, 100, "Blue Room");
        var ex = Record.Exception(() => booking.ValidateState());
        Assert.Null(ex);
    }
}

public sealed class BookingOpenedTests
{
    [Fact]
    public void BookingOpened_FQDN_IsCorrect()
    {
        var ev = new BookingOpened(
            EntityId.New<BookingId>(),
            Guid.NewGuid(),
            "Blue Room",
            DateTime.UtcNow.AddDays(1),
            2, 1, [1, 2, 3]);

        Assert.Equal("howestprime.movies.MovieEvent.BookingOpened", ev.FQDN);
    }

    [Fact]
    public void BookingOpened_Properties_AreSetCorrectly()
    {
        var bookingId = EntityId.New<BookingId>();
        var movieId = Guid.NewGuid();
        var showtime = DateTime.UtcNow.AddDays(1);

        var ev = new BookingOpened(bookingId, movieId, "Yellow Room", showtime, 3, 2, [1, 2, 3, 4, 5]);

        Assert.Equal(bookingId, ev.BookingId);
        Assert.Equal(movieId, ev.MovieId);
        Assert.Equal("Yellow Room", ev.Room);
        Assert.Equal(showtime, ev.Showtime);
        Assert.Equal(3, ev.StandardVisitors);
        Assert.Equal(2, ev.DiscountedVisitors);
        Assert.Equal([1, 2, 3, 4, 5], ev.SeatNumbers);
    }

    [Fact]
    public void BookingOpened_OccurredOn_IsRecentUtc()
    {
        var before = DateTime.UtcNow.AddSeconds(-1);
        var ev = new BookingOpened(
            EntityId.New<BookingId>(),
            Guid.NewGuid(), "Blue Room",
            DateTime.UtcNow.AddDays(1),
            1, 0, [1]);
        var after = DateTime.UtcNow.AddSeconds(1);

        Assert.InRange(ev.OccurredOn, before, after);
    }
}

public sealed class MovieEventAssertsBookingTests
{
    [Fact]
    public void EnsureVisitorCountIsGreaterThanZero_Zero_Throws()
        => Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureVisitorCountIsGreaterThanZero(0));

    [Fact]
    public void EnsureVisitorCountIsGreaterThanZero_Negative_Throws()
        => Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureVisitorCountIsGreaterThanZero(-1));

    [Fact]
    public void EnsureVisitorCountIsGreaterThanZero_Valid_DoesNotThrow()
    {
        var ex = Record.Exception(() => MovieEventAsserts.EnsureVisitorCountIsGreaterThanZero(1));
        Assert.Null(ex);
    }

    [Fact]
    public void EnsureCapacityNotExceeded_Exceeded_Throws()
        => Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureCapacityNotExceeded(8, 5, 10));

    [Fact]
    public void EnsureCapacityNotExceeded_Exact_DoesNotThrow()
    {
        var ex = Record.Exception(() => MovieEventAsserts.EnsureCapacityNotExceeded(5, 5, 10));
        Assert.Null(ex);
    }

    [Fact]
    public void EnsureShowtimeIsWithin14Days_TooFar_Throws()
        => Assert.Throws<ArgumentException>(() =>
            MovieEventAsserts.EnsureShowtimeIsWithin14Days(DateTime.Now.AddDays(15)));

    [Fact]
    public void EnsureShowtimeIsWithin14Days_Within_DoesNotThrow()
    {
        var ex = Record.Exception(() =>
            MovieEventAsserts.EnsureShowtimeIsWithin14Days(DateTime.Now.AddDays(7)));
        Assert.Null(ex);
    }
}
