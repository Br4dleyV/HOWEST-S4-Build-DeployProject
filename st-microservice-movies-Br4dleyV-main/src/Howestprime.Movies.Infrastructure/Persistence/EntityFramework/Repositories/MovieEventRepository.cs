using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Microsoft.EntityFrameworkCore;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Repositories;

public sealed class MovieEventRepository(DomainDbContext context)
    : EfCoreGenericRepository<MovieEvent, MovieEventId>(context), IMovieEventRepository
{
    public async Task<MovieEvent?> ByShowtimeAndRoomId(DateTime showtime, RoomId roomId)
    {
        return await _context.MovieEvents
            .FirstOrDefaultAsync(e => e.Showtime == showtime && e.RoomId == roomId);
    }

    public async Task<MovieEvent?> ByBookingId(BookingId bookingId)
    {
        return await _context.MovieEvents
            .Include(e => e.Bookings)
            .FirstOrDefaultAsync(e => e.Bookings.Any(b => b.Id == bookingId));
    }

    public Task<bool> ExistsForMovie(MovieId movieId)
    {
        return _context.MovieEvents.AnyAsync(e => e.MovieId == movieId);
    }
}
