using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.MovieEvents;

public interface IMovieEventRepository : IRepository<MovieEvent, MovieEventId>
{
    /// <summary>
    /// Finds an existing movie event by showtime and room, if any.
    /// </summary>
    /// <param name="showtime">The showtime of the event.</param>
    /// <param name="roomId">The room ID of the event.</param>
    /// <returns>The movie event if found; otherwise, null.</returns>
    Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId);

    /// <summary>
    /// Finds an existing movie event that contains the specified booking id.
    /// </summary>
    /// <param name="bookingId">The booking id to search for.</param>
    /// <returns>The movie event if found; otherwise, null.</returns>
    Task<MovieEvent?> ByBookingId(BookingId bookingId);

    /// <summary>
    /// Check if there are any movie events associated with the specified movie id.
    /// </summary>
    /// <param name="movieId">The movie id to search for.</param>
    /// <returns>true if there are events associated with the movie; otherwise, false.</returns>
    Task<bool> ExistsForMovie(MovieId movieId);
}
