namespace Howestprime.Movies.Domain.MovieEvents;

public enum BookingStatus
{
    Open,
    Closed
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Failed
}

public enum CloseBookingReason
{
    PaymentFailed,
    PaymentSuccess
}
