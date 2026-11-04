using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public record ScheduleMovieEventBody(
    [Required] Guid MovieId,
    [Required] Guid RoomId,
    [Required] DateTime Showtime
);

public static class ScheduleMovieEventController
{
    public static async Task<IResult> Invoke(
        [FromBody] ScheduleMovieEventBody body,
        [FromServices] IUseCase<ScheduleMovieEventInput, Guid> useCase
    )
    {
        try
        {
            var input = new ScheduleMovieEventInput(
                body.MovieId,
                body.RoomId,
                body.Showtime
            );

            Guid eventId = await useCase.Execute(input);

            return TypedResults.Created($"/api/movie-events/{eventId}", new { Id = eventId });
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(new { Error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return TypedResults.NotFound(new { Error = ex.Message });
        }
    }
}
