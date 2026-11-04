using System.Linq.Expressions;

namespace Howestprime.Movies.Application.Contracts.Data.Filters;

public static class MovieEventDataFilters
{
    /// <summary>
    /// Returns a predicate that filters movie events whose showtime falls within [from, to].
    /// Both bounds are converted to UTC before comparison.
    /// </summary>
    public static Expression<Func<MovieEventData, bool>> ByTimeRange(DateTime from, DateTime to)
    {
        DateTime utcFrom = from.ToUniversalTime();
        DateTime utcTo   = to.ToUniversalTime();

        return ev => ev.Showtime >= utcFrom && ev.Showtime <= utcTo;
    }
}
