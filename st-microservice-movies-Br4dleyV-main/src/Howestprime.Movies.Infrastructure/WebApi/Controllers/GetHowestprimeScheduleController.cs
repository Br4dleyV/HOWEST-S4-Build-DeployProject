using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration;
using Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public record GetHowestprimeScheduleRequest(
    [FromServices] IUseCase<SearchMovieEventsInTimeRangeInput, IReadOnlyList<MovieEventData>> UseCase,
    [FromServices] IMovieEventQuery MovieEventQuery,
    [FromServices] QueryDbContext QueryDbContext
);

public static class GetHowestprimeScheduleController
{
    public static async Task<IResult> Invoke(
        [FromServices] IUseCase<SearchMovieEventsInTimeRangeInput, IReadOnlyList<MovieEventData>> useCase,
        [FromServices] QueryDbContext queryContext
    )
    {
        DateTime from = DateTime.Now;
        DateTime to   = DateTime.Now.AddDays(14);

        var input = new SearchMovieEventsInTimeRangeInput(from, to);
        IReadOnlyList<MovieEventData> events = await useCase.Execute(input);

        // Get all movies and rooms related to the events
        var movieIds = events.Select(e => e.MovieId).Distinct().ToList();
        var roomIds  = events.Select(e => e.RoomId).Distinct().ToList();
        var movies = queryContext.Movies
            .Where(m => movieIds.Contains(m.Id))
            .ToDictionary(m => m.Id);
        var rooms = queryContext.Rooms
            .Where(r => roomIds.Contains(r.Id))
            .ToDictionary(r => r.Id);

        // Map events to scheduled events with movie and room details
        var scheduledEvents = events.Select(ev =>
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
        }).OrderBy(e => e.Showtime);

        // Create the schedule response
        var schedule = new HowestprimeSchedule(from, to, scheduledEvents);

        return TypedResults.Ok(schedule);
    }
}
