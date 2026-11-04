using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.WebApi.Controllers.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Howestprime.Movies.Infrastructure.WebApi.Controllers;

public static class RegisterMovieController
{
    public static async Task<Results<Created, BadRequest>> Invoke(
        [FromBody] RegisterMovieBody body,
        [FromServices] IUseCase<RegisterMovieInput, Guid> useCase
    )
    {
        RegisterMovieInput input = new(
            Title: body.Title,
            Description: body.Description,
            Duration: body.Duration,
            Genres: body.Genres,
            ReleaseYear: body.ReleaseYear,
            Actors: body.Actors,
            AgeRating: body.AgeRating,
            PosterUrl: body.PosterUrl
        );

        Guid movieId = await useCase.Execute(input);

        return TypedResults.Created($"/api/movie-catalog/{movieId}");
    }
}

public record RegisterMovieBody(
[Required] string Title,
    [Required] string Description,
    [Required] int Duration,
    [Required] IEnumerable<string> Genres,
    [Required] int ReleaseYear,
    [Required] IEnumerable<string> Actors,
    [Required] int AgeRating,
    [Required] string PosterUrl
);
