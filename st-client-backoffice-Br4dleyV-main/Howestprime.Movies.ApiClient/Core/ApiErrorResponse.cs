namespace Howestprime.Movies.ApiClient.Core;

public sealed class ApiErrorResponse
{
    public ApiErrorResponse(
        int statusCode,
        string? title,
        string? detail,
        IReadOnlyDictionary<string, IReadOnlyList<string>>? errors,
        string? rawBody)
    {
        StatusCode = statusCode;
        Title = title;
        Detail = detail;
        Errors = errors;
        RawBody = rawBody;
    }

    public int StatusCode { get; }

    public string? Title { get; }

    public string? Detail { get; }

    public IReadOnlyDictionary<string, IReadOnlyList<string>>? Errors { get; }

    public string? RawBody { get; }
}
