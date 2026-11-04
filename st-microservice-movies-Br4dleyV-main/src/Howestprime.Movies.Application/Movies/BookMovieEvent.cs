using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record BookMovieEventInput(
    Guid MovieEventId,
    int StandardVisitors,
    int DiscountVisitors
);

public sealed class BookMovieEvent(
    IUnitOfWork uow,
    ILogger<BookMovieEvent> logger
) : IUseCase<BookMovieEventInput, Guid>
{
    public async Task<Guid> Execute(BookMovieEventInput input)
    {
        var movieEventId = new MovieEventId(input.MovieEventId);
        var movieEventRepo = uow.Repo<IMovieEventRepository>();
        var maybeEvent = await movieEventRepo.ById(movieEventId);

        if (!maybeEvent.HasValue)
            throw new KeyNotFoundException(
                $"Movie event '{input.MovieEventId}' was not found.");

        MovieEvent movieEvent = maybeEvent.Value;

        var roomRepo = uow.Repo<IRoomRepository>();
        var maybeRoom = await roomRepo.ById(movieEvent.RoomId);

        if (!maybeRoom.HasValue)
            throw new KeyNotFoundException(
                $"Room '{movieEvent.RoomId.Value}' was not found.");

        Room room = maybeRoom.Value;

        var bookingId = EntityId.New<BookingId>();
        movieEvent.Book(
            bookingId,
            input.StandardVisitors,
            input.DiscountVisitors,
            room.Capacity,
            room.Name
        );

        await movieEventRepo.Save(movieEvent);
        await uow.Do();

        logger.LogInformation(
            "Booking {BookingId} created for movie event {MovieEventId}.",
            bookingId.Value, input.MovieEventId);

        return bookingId.Value;
    }
}
