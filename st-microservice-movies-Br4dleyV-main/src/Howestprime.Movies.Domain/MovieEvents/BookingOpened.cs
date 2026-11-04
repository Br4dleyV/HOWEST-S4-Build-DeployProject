namespace Howestprime.Movies.Domain.MovieEvents;

/// <summary>
/// Domain event raised when a booking is successfully opened on a movie event.
/// FQDN: howestprime.movies.movieevent.bookingopened
/// </summary>
public sealed class BookingOpened(
    BookingId bookingId,
    Guid movieId,
    string room,
    DateTime showtime,
    int standardVisitors,
    int discountedVisitors,
    IReadOnlyList<int> seatNumbers
) : MovieEventDomainEvent(nameof(BookingOpened))
{
    public BookingId BookingId { get; } = bookingId;
    public Guid MovieId { get; } = movieId;
    public string Room { get; } = room;
    public DateTime Showtime { get; } = showtime;
    public int StandardVisitors { get; } = standardVisitors;
    public int DiscountedVisitors { get; } = discountedVisitors;
    public IReadOnlyList<int> SeatNumbers { get; } = seatNumbers;
}
