
using Howestprime.Movies.Application.Contracts.Data;
using System.Linq.Expressions;

namespace Howestprime.Movies.Application.Contracts.Ports;

public interface ISearchMovieCatalogQuery
{
    /// <summary>
    /// Fetches movies from the catalog based on provided filters.
    /// This method fetches movies from the catalog based on the provided filter expression.
    /// </summary>
    /// <param name="movieFilter">The filter expression to apply to the movie catalog.</param>
    /// <returns>A list of movies that match the filter criteria.</returns>
    public Task<IReadOnlyList<MovieData>> Fetch(
        Expression<Func<MovieData, bool>> movieFilter
    );
}

public interface IMovieEventQuery
{
    /// <summary>
    /// Fetches movie events from the database based on the provided filter expression.
    /// </summary>
    /// <param name="filter">The filter expression to apply to the database</param>
    Task<IReadOnlyList<MovieEventData>> Fetch(
        Expression<Func<MovieEventData, bool>> filter
    );
}