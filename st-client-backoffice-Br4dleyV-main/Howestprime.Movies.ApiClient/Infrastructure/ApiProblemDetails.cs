namespace Howestprime.Movies.ApiClient.Infrastructure;

internal sealed class ApiProblemDetails
{
    public string? Title { get; init; }

    public string? Detail { get; init; }

    public Dictionary<string, string[]>? Errors { get; init; }
}
