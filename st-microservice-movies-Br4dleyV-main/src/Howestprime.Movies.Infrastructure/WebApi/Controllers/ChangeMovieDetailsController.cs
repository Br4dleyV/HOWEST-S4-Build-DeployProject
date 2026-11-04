using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public static class ChangeMovieDetailsController
{
    public static async Task<IResult> Invoke(
        [FromRoute] Guid movieId,
        [FromBody] ChangeMovieDetailsBody body,
        [FromServices] IUseCase<ChangeMovieDetailsInput, Guid> useCase
    )
    {
        try
        {
            var input = new ChangeMovieDetailsInput(
                MovieId: movieId,
                Title: body.Title,
                Description: body.Description,
                Duration: body.Duration,
                Genres: body.Genres,
                ReleaseYear: body.ReleaseYear,
                Actors: body.Actors,
                AgeRating: body.AgeRating,
                PosterUrl: body.PosterUrl
            );

            await useCase.Execute(input);
            return TypedResults.NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return TypedResults.NotFound(new { Error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(new { Error = ex.Message });
        }
    }
}

public record ChangeMovieDetailsBody(
    [Required] string Title,
    [Required] string Description,
    [Required] int Duration,
    [Required] IEnumerable<string> Genres,
    [Required] int ReleaseYear,
    [Required] IEnumerable<string> Actors,
    [Required] int AgeRating,
    [Required] string PosterUrl
);