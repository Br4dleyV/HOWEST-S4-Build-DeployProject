using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public record BookMovieEventRequest(
    [FromRoute] Guid MovieEventId,
    [FromBody] BookMovieEventBody Body,
    [FromServices] IUseCase<BookMovieEventInput, Guid> UseCase
);

public record BookMovieEventBody(
    [Required] int StandardVisitors,
    [Required] int DiscountVisitors
);

public static class BookMovieEventController
{
    public static async Task<IResult> Invoke(
        [AsParameters] BookMovieEventRequest request
    )
    {
        try
        {
            var input = new BookMovieEventInput(
                request.MovieEventId,
                request.Body.StandardVisitors,
                request.Body.DiscountVisitors
            );

            Guid bookingId = await request.UseCase.Execute(input);

            return TypedResults.Created(
                $"/api/movie-events/{request.MovieEventId}/bookings/{bookingId}",
                new { Id = bookingId });
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
