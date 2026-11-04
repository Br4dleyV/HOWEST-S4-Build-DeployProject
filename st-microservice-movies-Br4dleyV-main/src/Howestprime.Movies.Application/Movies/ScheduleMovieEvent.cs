using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record ScheduleMovieEventInput(
    Guid MovieId,
    Guid RoomId,
    DateTime Showtime
);

public sealed class ScheduleMovieEvent(
    IUnitOfWork uow,
    ILogger<ScheduleMovieEvent> logger
) : IUseCase<ScheduleMovieEventInput, Guid>
{
    public async Task<Guid> Execute(ScheduleMovieEventInput input)
    {
        // Validate if the showtime is valid
        MovieEventAsserts.EnsureShowtimeIsAt15hOr19h(input.Showtime);
        MovieEventAsserts.EnsureShowtimeIsInTheFuture(input.Showtime);

        // Check if the movie exists
        MovieId movieId = new(input.MovieId);
        bool movieExists = await uow.Repo<IMovieRepository>().Exists(movieId);
        if (!movieExists)
            throw new KeyNotFoundException($"Movie with id '{input.MovieId}' was not found.");

        // Check if the room exists
        RoomId roomId = new(input.RoomId);
        bool roomExists = await uow.Repo<IRoomRepository>().Exists(roomId);
        if (!roomExists)
            throw new KeyNotFoundException($"Room with id '{input.RoomId}' was not found.");

        // Check if a movie event already exists for this showtime and room
        var movieEventRepo = uow.Repo<IMovieEventRepository>();
        MovieEvent? existing = await movieEventRepo.ByShowtimeAndRoomId(input.Showtime, roomId);

        MovieEvent movieEvent;
        if (existing is not null)
        {
            // Overwrite the movieId on the existing event
            existing.AssignMovie(movieId);
            await movieEventRepo.Save(existing);
            movieEvent = existing;
        }
        else
        {
            // Schedule a new event
            movieEvent = MovieEvent.Schedule(
                EntityId.New<MovieEventId>(),
                movieId,
                roomId,
                input.Showtime
            );
            await movieEventRepo.Save(movieEvent);
        }

        await uow.Do();

        return movieEvent.Id.Value;
    }
}
