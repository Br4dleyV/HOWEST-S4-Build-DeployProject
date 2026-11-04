using System.Linq.Expressions;

namespace Howestprime.Movies.Application.Contracts.Data.Filters;

public static class MovieDataFilters
{
    /// <summary>
    /// Returns a predicate that filters movies based on a title substring and a comma-separated list of genres.
    /// </summary>
    /// <param name="title">The title substring to search for.</param>
    /// <param name="genres">A comma-separated list of genres to filter by.</param>
    /// <returns>A predicate that can be used to filter movies.</returns>
    public static Expression<Func<MovieData, bool>> ByTitleAndGenres(string title, string genres)
    {
        // Split the genres string into a list of trimmed, lowercase genre names
        List<string> genreList = [];
        if (!string.IsNullOrEmpty(genres))
        {
            genreList = [.. genres.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Select(g => g.ToLower())];
        }

        // Return a predicate (a function that returns a bool) that checks if a movie matches the title and genres criteria
        return movie =>
            (string.IsNullOrEmpty(title) || movie.Title.ToLower().Contains(title.ToLower()))
            &&
            (!genreList.Any() || genreList.All(g => movie.Genres.Any(mg => mg.Value.ToLower() == g)));
    }

    /// <summary>
    /// Returns a predicate that filters movies based on their unique identifier (ID).
    /// </summary>
    /// <param name="movieId">The unique identifier of the movie.</param>
    /// <returns>A predicate that can be used to filter movies by ID.</returns>
    public static Expression<Func<MovieData, bool>> ById(Guid movieId)
    {
        return movie => movie.Id == movieId;
    }
}
