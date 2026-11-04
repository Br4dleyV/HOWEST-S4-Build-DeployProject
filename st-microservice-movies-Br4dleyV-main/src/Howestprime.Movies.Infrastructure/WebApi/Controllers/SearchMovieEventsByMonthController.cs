using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public static class SearchMovieEventsByMonthController
{
    public static async Task<IResult> Invoke(
        [FromQuery] int? year,
        [FromQuery] int? month,
        [FromServices] IUseCase<SearchMovieEventsInTimeRangeInput, IReadOnlyList<MovieEventData>> useCase,
        [FromServices] QueryDbContext queryContext
    )
    {
        // Validate year and month and return empty list when invalid
        if (!IsValidYearMonth(year, month))
            return TypedResults.Ok(Array.Empty<MovieEvent>());

        // Get full range (because sometimes it doesn't get them all for some reason, so I do it like this)
        var from = new DateTime(year!.Value, month!.Value, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = from.AddMonths(1).AddTicks(-1);

        // Get events
        var input = new SearchMovieEventsInTimeRangeInput(from, to);
        IReadOnlyList<MovieEventData> events = await useCase.Execute(input);

        // If none are found, return an empty array
        if (events.Count == 0)
            return TypedResults.Ok(Array.Empty<MovieEvent>());

        // Fill events
        var movieIds = events.Select(e => e.MovieId).Distinct().ToList();
        var roomIds = events.Select(e => e.RoomId).Distinct().ToList();
        var movies = queryContext.Movies
            .Where(m => movieIds.Contains(m.Id))
            .ToDictionary(m => m.Id);
        var rooms = queryContext.Rooms
            .Where(r => roomIds.Contains(r.Id))
            .ToDictionary(r => r.Id);

        // Create response array
        var response = events
            .Select(ev =>
            {
                movies.TryGetValue(ev.MovieId, out var movie);
                rooms.TryGetValue(ev.RoomId, out var room);

                var movieResponse = new Movie(
                    movie?.Id ?? ev.MovieId,
                    movie?.Title ?? "Unknown",
                    movie?.Description ?? string.Empty,
                    movie?.Duration ?? 0,
                    movie?.ReleaseYear ?? 0,
                    (movie?.AgeRating ?? 0).ToString(),
                    movie?.PosterUrl ?? string.Empty,
                    movie?.Genres.Select(g => g.Value) ?? [],
                    movie?.Actors.Select(a => a.Value) ?? [],
                    []
                );

                var roomResponse = new Room(
                    room?.Id ?? ev.RoomId,
                    room?.Name ?? "Unknown",
                    room?.Capacity ?? 0
                );

                return new MovieEvent(
                    Id: ev.Id,
                    Movie: movieResponse,
                    Room: roomResponse,
                    Showtime: ev.Showtime,
                    Capacity: room?.Capacity ?? 0
                );
            })
            .OrderBy(e => e.Showtime);

        return TypedResults.Ok(response);
    }

    private static bool IsValidYearMonth(int? year, int? month)
    {
        if (year is null || month is null) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1) return false;
        return true;
    }
}
