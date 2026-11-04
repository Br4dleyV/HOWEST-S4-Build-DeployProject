using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.MovieEvents;

public readonly record struct BookingId(Guid Value) : IEntityId;

/// <summary>
/// Represents a customer booking for a movie event.
/// A Booking only has meaning within the context of a MovieEvent.
/// </summary>
public sealed class Booking : Entity<BookingId>
{
    public int StandardVisitors { get; private set; }
    public int DiscountVisitors { get; private set; }
    public IReadOnlyList<int> SeatNumbers { get; private set; } = [];
    public BookingStatus BookingStatus { get; private set; }
    public PaymentStatus PaymentStatus { get; private set; }

    private Booking() { }

    private Booking(
        BookingId id,
        int standardVisitors,
        int discountVisitors,
        IReadOnlyList<int> seatNumbers
    ) : base(id)
    {
        StandardVisitors = standardVisitors;
        DiscountVisitors = discountVisitors;
        SeatNumbers = seatNumbers;
        BookingStatus = BookingStatus.Open;
        PaymentStatus = PaymentStatus.Pending;
    }

    internal static Booking Create(
        BookingId id,
        int standardVisitors,
        int discountVisitors,
        int firstSeatNumber
    )
    {
        int total = standardVisitors + discountVisitors;
        var seats = Enumerable.Range(firstSeatNumber, total).ToList();
        return new Booking(id, standardVisitors, discountVisitors, seats);
    }

    public void Close(CloseBookingReason reason)
    {
        var totalVisitors = StandardVisitors + DiscountVisitors;

        BookingStatus = BookingStatus.Closed;
        PaymentStatus = reason == CloseBookingReason.PaymentSuccess
            ? PaymentStatus.Paid
            : PaymentStatus.Failed;

        if (reason == CloseBookingReason.PaymentFailed)
        {
            // Release the seats and reset visitor counts so seats are available again.
            SeatNumbers = new List<int>().AsReadOnly();
            StandardVisitors = 0;
            DiscountVisitors = 0;
        }
    }

    public override void ValidateState() { }
}
