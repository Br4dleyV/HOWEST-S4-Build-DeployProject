using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.MovieEvents;

public readonly record struct MovieEventId(Guid Value) : IEntityId;

public sealed class MovieEvent : AggregateRoot<MovieEventId>
{
    public MovieId MovieId { get; private set; }
    public RoomId RoomId { get; private set; }
    public DateTime Showtime { get; private set; }
    public int Visitors { get; private set; }

    private readonly List<Booking> _bookings = [];
    public IReadOnlyList<Booking> Bookings => _bookings.AsReadOnly();

    private MovieEvent() { }

    private MovieEvent(MovieEventId id, MovieId movieId, RoomId roomId, DateTime showtime)
        : base(id)
    {
        MovieId = movieId;
        RoomId = roomId;
        Showtime = showtime;
        Visitors = 0;
    }

    public static MovieEvent Schedule(MovieEventId id, MovieId movieId, RoomId roomId, DateTime showtime)
    {
        MovieEventAsserts.EnsureShowtimeIsAt15hOr19h(showtime);
        MovieEventAsserts.EnsureShowtimeIsInTheFuture(showtime);
        return new MovieEvent(id, movieId, roomId, showtime);
    }

    /// <summary>
    /// Reassigns the movie for this event (used when overwriting an existing slot).
    /// </summary>
    public void AssignMovie(MovieId movieId)
    {
        MovieId = movieId;
    }

    /// <summary>
    /// Books seats for this movie event. Validates all preconditions and raises BookingOpened.
    /// </summary>
    public Booking Book(
        BookingId bookingId,
        int standardVisitors,
        int discountVisitors,
        int roomCapacity,
        string roomName
    )
    {
        int totalNewVisitors = standardVisitors + discountVisitors;

        MovieEventAsserts.EnsureVisitorCountIsGreaterThanZero(totalNewVisitors);
        MovieEventAsserts.EnsureShowtimeIsWithin14Days(Showtime);
        MovieEventAsserts.EnsureCapacityNotExceeded(Visitors, totalNewVisitors, roomCapacity);

        int firstSeat = Visitors + 1;
        var booking = Booking.Create(bookingId, standardVisitors, discountVisitors, firstSeat);

        _bookings.Add(booking);
        Visitors += totalNewVisitors;

        RaiseDomainEvent(new BookingOpened(
            bookingId: bookingId,
            movieId: MovieId.Value,
            room: roomName,
            showtime: Showtime,
            standardVisitors: standardVisitors,
            discountedVisitors: discountVisitors,
            seatNumbers: booking.SeatNumbers
        ));

        return booking;
    }

    public void CloseBooking(BookingId bookingId, CloseBookingReason reason)
    {
        var booking = _bookings.FirstOrDefault(b => b.Id == bookingId)
            ?? throw new KeyNotFoundException($"Booking '{bookingId.Value}' was not found.");

        var totalVisitors = booking.StandardVisitors + booking.DiscountVisitors;

        booking.Close(reason);

        if (reason == CloseBookingReason.PaymentFailed)
        {
            Visitors -= totalVisitors;
        }
    }

    public override void ValidateState() { }
}
