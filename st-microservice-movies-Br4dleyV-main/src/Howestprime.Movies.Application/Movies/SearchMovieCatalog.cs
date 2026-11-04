using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;
using Howestprime.Movies.Application.Contracts.Ports;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record SearchMovieCatalogInput(
    string Title,
    string Genres,
    string UserRole
);

public sealed class SearchMovieCatalog(
    ISearchMovieCatalogQuery query,
    ILogger<SearchMovieCatalog> logger
) : IUseCase<SearchMovieCatalogInput, IReadOnlyList<MovieData>>
{
    /// <summary>
    /// Searches the movie catalog based on the provided title and genres. 
    /// Only users with the "Manager" role are authorized to perform this search.
    /// </summary>
    /// <param name="input">The input containing the search criteria and user role.</param>
    /// <returns>A list of movies that match the search criteria.</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when the user is not authorized to perform the search.</exception>
    public async Task<IReadOnlyList<MovieData>> Execute(SearchMovieCatalogInput input)
    {
        logger.LogInformation("Searching movie catalog for Title: {Title}", input.Title);

        if (string.IsNullOrWhiteSpace(input.UserRole) &&
            !input.UserRole.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException($"You are not allowed to search the movie catalog.");

        var filter = MovieDataFilters.ByTitleAndGenres(input.Title, input.Genres);

        return await query.Fetch(filter);
    }
}