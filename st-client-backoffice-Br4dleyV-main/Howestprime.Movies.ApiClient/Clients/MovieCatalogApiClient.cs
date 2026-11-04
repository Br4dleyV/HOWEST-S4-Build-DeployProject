using System.Text.Json;
using Howestprime.Movies.ApiClient.Core;
using Howestprime.Movies.ApiClient.Infrastructure;
using Howestprime.Movies.ApiClient.Requests;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Movies.ApiClient.Clients;

public sealed class MovieCatalogApiClient(HttpClient httpClient, JsonSerializerOptions serializerOptions)
    : HttpApiClientBase(httpClient, serializerOptions), IMovieCatalogApiClient
{
    public Task<ApiResult<Created>> RegisterMovieAsync(RegisterMovieRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var message = CreateRequest(HttpMethod.Post, "api/movie-catalog");
        SetJsonBody(message, request);

        return SendForCreatedAsync(message, ct);
    }

    public Task<ApiResult<MovieCollection>> SearchMovieCatalogAsync(SearchMovieCatalogRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        EnsureNotBlank(request.UserRole, nameof(request.UserRole));

        var path = BuildPathWithQuery(
            "api/movie-catalog",
            ("title", request.Title),
            ("genres", request.Genres));

        var message = CreateRequest(HttpMethod.Get, path);
        AddRequiredHeader(message, "x-user-role", request.UserRole);

        return SendForJsonAsync<MovieCollection>(message, ct);
    }
}
