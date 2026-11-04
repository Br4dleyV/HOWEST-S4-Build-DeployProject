using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record CloseBookingInput(
    Guid BookingId, 
    CloseBookingReason Reason
);

public sealed class CloseBooking(
    IUnitOfWork uow,
    ILogger<CloseBooking> logger
) : IUseCase<CloseBookingInput>
{
    public async Task Execute(CloseBookingInput input)
    {
        // Get movie event by BookingID
        var bookingId = new BookingId(input.BookingId);
        var movieEventRepo = uow.Repo<IMovieEventRepository>();
        var maybeEvent = await movieEventRepo.ByBookingId(bookingId);

        if (maybeEvent is null)
            throw new KeyNotFoundException($"Booking '{input.BookingId}' was not found.");

        // If movie event is found, close it
        var movieEvent = maybeEvent;
        movieEvent.CloseBooking(bookingId, input.Reason);

        await movieEventRepo.Save(movieEvent);
        await uow.Do();

        logger.LogInformation("Booking {BookingId} closed for movie event {MovieEventId}.", input.BookingId, movieEvent.Id.Value);
    }
}
