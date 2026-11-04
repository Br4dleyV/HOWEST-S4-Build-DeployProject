using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public record SearchMovieCatalogRequest(
    [FromHeader(Name = "x-user-role")] string? UserRole,
    [FromQuery] string? Title,
    [FromQuery] string? Genres,
    [FromServices] IUseCase<SearchMovieCatalogInput, IReadOnlyList<MovieData>> UseCase
);

public static class SearchMovieCatalogController
{
    public static async Task<IResult> Invoke(
        [AsParameters] SearchMovieCatalogRequest request
    )
    {
        try
        {
            var input = new SearchMovieCatalogInput(
                request.Title ?? string.Empty,
                request.Genres ?? string.Empty,
                request.UserRole ?? string.Empty
            );

            var movies = await request.UseCase.Execute(input);

            var response = movies.Select(movie => new Movie(
                movie.Id,
                movie.Title,
                movie.Description,
                movie.Duration,
                movie.ReleaseYear,
                movie.AgeRating.ToString(),
                movie.PosterUrl,
                movie.Genres.Select(g => g.Value),
                movie.Actors.Select(a => a.Value),
                Enumerable.Empty<DateTime>()
            ));

            return TypedResults.Ok(new { Data = response });
        }
        catch (UnauthorizedAccessException ex)
        {
            return TypedResults.BadRequest(new { Error = ex.Message });
        }
    }
}