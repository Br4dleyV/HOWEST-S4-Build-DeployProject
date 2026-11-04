using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Howestprime.Movies.ApiClient.Core;
using Howestprime.Movies.ApiClient.Responses;

namespace Howestprime.Movies.ApiClient.Infrastructure;

public abstract class HttpApiClientBase
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _serializerOptions;

    protected HttpApiClientBase(HttpClient httpClient, JsonSerializerOptions serializerOptions)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _serializerOptions = serializerOptions ?? throw new ArgumentNullException(nameof(serializerOptions));
    }

    protected static HttpRequestMessage CreateRequest(HttpMethod method, string pathAndQuery)
    {
        ArgumentNullException.ThrowIfNull(method);
        ArgumentException.ThrowIfNullOrWhiteSpace(pathAndQuery);
        return new HttpRequestMessage(method, pathAndQuery);
    }

    protected void SetJsonBody<TBody>(HttpRequestMessage request, TBody body)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(body);
        request.Content = JsonContent.Create(body, options: _serializerOptions);
    }

    protected static void AddRequiredHeader(HttpRequestMessage request, string name, string value)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(value);
        request.Headers.Add(name, value);
    }

    protected static void EnsureNotBlank(string? value, string paramName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException($"'{paramName}' is required.", paramName);
        }
    }

    protected static string BuildPathWithQuery(string path, params (string Name, string? Value)[] queryValues)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);

        if (queryValues.Length == 0)
        {
            return path;
        }

        var builder = new StringBuilder(path);
        var hasAppendedQuery = false;

        foreach (var (name, value) in queryValues)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            builder.Append(hasAppendedQuery ? '&' : '?');
            builder.Append(Uri.EscapeDataString(name));
            builder.Append('=');
            builder.Append(Uri.EscapeDataString(value));
            hasAppendedQuery = true;
        }

        return builder.ToString();
    }

    protected async Task<ApiResult<TResponse>> SendForJsonAsync<TResponse>(HttpRequestMessage request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        using (request)
        {
            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);

            if (!response.IsSuccessStatusCode)
            {
                return await CreateFailureResult<TResponse>(response, ct);
            }

            var rawBody = response.Content is null ? null : await response.Content.ReadAsStringAsync(ct);
            if (string.IsNullOrWhiteSpace(rawBody))
            {
                return ApiResult<TResponse>.Failure(
                    new ApiErrorResponse(
                        (int)response.StatusCode,
                        "Invalid response payload",
                        "Response body was empty while JSON payload was expected.",
                        null,
                        rawBody));
            }

            try
            {
                var value = JsonSerializer.Deserialize<TResponse>(rawBody, _serializerOptions);
                if (value is null)
                {
                    return ApiResult<TResponse>.Failure(
                        new ApiErrorResponse(
                            (int)response.StatusCode,
                            "Invalid response payload",
                            "Response body could not be deserialized to the expected payload.",
                            null,
                            rawBody));
                }

                return ApiResult<TResponse>.Success(value, (int)response.StatusCode);
            }
            catch (JsonException)
            {
                return ApiResult<TResponse>.Failure(
                    new ApiErrorResponse(
                        (int)response.StatusCode,
                        "Invalid response payload",
                        "Response body could not be deserialized to the expected payload.",
                        null,
                        rawBody));
            }
        }
    }

    protected async Task<ApiResult<Created>> SendForCreatedAsync(HttpRequestMessage request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        using (request)
        {
            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);

            if (!response.IsSuccessStatusCode)
            {
                return await CreateFailureResult<Created>(response, ct);
            }

            return ApiResult<Created>.Success(
                new Created
                {
                    Location = response.Headers.Location?.ToString()
                },
                (int)response.StatusCode);
        }
    }

    private async Task<ApiResult<TResponse>> CreateFailureResult<TResponse>(HttpResponseMessage response, CancellationToken ct)
    {
        var rawBody = response.Content is null ? null : await response.Content.ReadAsStringAsync(ct);
        var error = ParseErrorResponse(response, rawBody);
        return ApiResult<TResponse>.Failure(error);
    }

    private ApiErrorResponse ParseErrorResponse(HttpResponseMessage response, string? rawBody)
    {
        if (!string.IsNullOrWhiteSpace(rawBody))
        {
            try
            {
                var problemDetails = JsonSerializer.Deserialize<ApiProblemDetails>(rawBody, _serializerOptions);
                if (problemDetails is not null)
                {
                    IReadOnlyDictionary<string, IReadOnlyList<string>>? validationErrors = null;
                    if (problemDetails.Errors is { Count: > 0 })
                    {
                        var mappedErrors = new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal);
                        foreach (var (key, values) in problemDetails.Errors)
                        {
                            mappedErrors[key] = values ?? [];
                        }

                        validationErrors = mappedErrors;
                    }

                    return new ApiErrorResponse(
                        (int)response.StatusCode,
                        problemDetails.Title ?? response.ReasonPhrase,
                        problemDetails.Detail,
                        validationErrors,
                        rawBody);
                }
            }
            catch (JsonException)
            {
                // We intentionally fall back to raw-body error data if payload is not JSON.
            }
        }

        return new ApiErrorResponse(
            (int)response.StatusCode,
            response.ReasonPhrase,
            null,
            null,
            rawBody);
    }
}
