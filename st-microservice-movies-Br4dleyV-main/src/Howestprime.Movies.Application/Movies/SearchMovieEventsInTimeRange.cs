using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;
using Howestprime.Movies.Application.Contracts.Ports;
using Microsoft.Extensions.Logging;

namespace Howestprime.Movies.Application.Movies;

public sealed record SearchMovieEventsInTimeRangeInput(
    DateTime? From,
    DateTime? To
);

public sealed class SearchMovieEventsInTimeRange(
    IMovieEventQuery query,
    ILogger<SearchMovieEventsInTimeRange> logger
) : IUseCase<SearchMovieEventsInTimeRangeInput, IReadOnlyList<MovieEventData>>
{
    public Task<IReadOnlyList<MovieEventData>> Execute(SearchMovieEventsInTimeRangeInput input)
    {
        // Fall back to Now when no dates are provided
        DateTime from = (input.From ?? DateTime.Now).ToUniversalTime();
        DateTime to   = (input.To   ?? DateTime.Now).ToUniversalTime();

        logger.LogInformation(
            "Searching movie events between {From} and {To} (UTC).", from, to);

        return query.Fetch(MovieEventDataFilters.ByTimeRange(from, to));
    }
}
