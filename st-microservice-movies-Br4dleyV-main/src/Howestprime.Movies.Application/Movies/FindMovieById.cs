using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;
using Howestprime.Movies.Application.Contracts.Ports;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record FindMovieByIdInput(
    Guid MovieId,
    string UserRole
);

public sealed class FindMovieById(
    ISearchMovieCatalogQuery query,
    ILogger<FindMovieById> logger
) : IUseCase<FindMovieByIdInput, MovieData>
{
    public async Task<MovieData> Execute(FindMovieByIdInput input)
    {
        logger.LogInformation("Finding movie by id: {MovieId}", input.MovieId);

        if (string.IsNullOrWhiteSpace(input.UserRole) &&
            !input.UserRole.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("You are not allowed to access movie details.");

        // Fetch the movie using the provided query and filter by the movie ID
        IReadOnlyList<MovieData> movies = await query.Fetch(
            MovieDataFilters.ById(input.MovieId)
        );

        return movies.FirstOrDefault()
            ?? throw new KeyNotFoundException($"Movie with id '{input.MovieId}' was not found.");
    }
}
