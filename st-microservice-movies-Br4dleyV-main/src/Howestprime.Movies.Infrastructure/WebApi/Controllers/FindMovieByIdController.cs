using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public record FindMovieByIdRequest(
    [FromRoute] Guid MovieId,
    [FromHeader(Name = "x-user-role")] string? UserRole,
    [FromServices] IUseCase<FindMovieByIdInput, MovieData> UseCase,
    [FromServices] IMovieEventQuery MovieEventQuery
);

public static class FindMovieByIdController
{
    public static async Task<IResult> Invoke(
        [AsParameters] FindMovieByIdRequest request
    )
    {
        try
        {
            var input = new FindMovieByIdInput(
                request.MovieId,
                request.UserRole ?? string.Empty
            );

            var movie = await request.UseCase.Execute(input);
            var now = DateTime.UtcNow;
            var movieEvents = await request.MovieEventQuery.Fetch(
                ev => ev.MovieId == movie.Id && ev.Showtime >= now
            );

            var showtimes = movieEvents
                .Select(ev => ev.Showtime)
                .Distinct()
                .OrderBy(showtime => showtime)
                .ToList();

            var response = new Movie(
                movie.Id,
                movie.Title,
                movie.Description,
                movie.Duration,
                movie.ReleaseYear,
                movie.AgeRating.ToString(),
                movie.PosterUrl,
                movie.Genres.Select(g => g.Value),
                movie.Actors.Select(a => a.Value),
                showtimes
            );

            return TypedResults.Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return TypedResults.BadRequest(new { Error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return TypedResults.NotFound(new { Error = ex.Message });
        }
    }
}
