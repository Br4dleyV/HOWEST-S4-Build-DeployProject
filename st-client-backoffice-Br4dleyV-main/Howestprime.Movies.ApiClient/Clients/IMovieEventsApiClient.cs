using Howestprime.Movies.ApiClient.Core;
using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Movies.ApiClient.Clients;

public interface IMovieEventsApiClient
{
    Task<ApiResult<Created>> ScheduleMovieEventAsync(ScheduleMovieEventRequest request, CancellationToken ct = default);

    Task<ApiResult<IReadOnlyList<MovieEvent>>> FindMovieEventsForMonthAsync(FindMovieEventsForMonthRequest request, CancellationToken ct = default);
}
