using System.Globalization;
using System.Text.Json;
using Howestprime.Movies.ApiClient.Core;
using Howestprime.Movies.ApiClient.Infrastructure;
using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Movies.ApiClient.Clients;

public sealed class MovieEventsApiClient(HttpClient httpClient, JsonSerializerOptions serializerOptions)
    : HttpApiClientBase(httpClient, serializerOptions), IMovieEventsApiClient
{
    public Task<ApiResult<Created>> ScheduleMovieEventAsync(ScheduleMovieEventRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var message = CreateRequest(HttpMethod.Post, "api/movie-events");
        SetJsonBody(message, request);

        return SendForCreatedAsync(message, ct);
    }

    public async Task<ApiResult<IReadOnlyList<MovieEvent>>> FindMovieEventsForMonthAsync(
        FindMovieEventsForMonthRequest request,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var path = BuildPathWithQuery(
            "api/movie-events",
            ("month", request.Month.ToString(CultureInfo.InvariantCulture)),
            ("year", request.Year.ToString(CultureInfo.InvariantCulture)));

        var message = CreateRequest(HttpMethod.Get, path);
        var result = await SendForJsonAsync<IReadOnlyList<MovieEvent>>(message, ct);

        if (result.IsFailure)
        {
            return ApiResult<IReadOnlyList<MovieEvent>>.Failure(result.Error!);
        }

        IReadOnlyList<MovieEvent> events = result.Value ?? [];
        return ApiResult<IReadOnlyList<MovieEvent>>.Success(events, result.StatusCode);
    }
}
