namespace Howestprime.Movies.ApiClient.Configuration;

public sealed class MoviesApiClientOptions
{
    public Uri? BaseUrl { get; set; }

    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(30);
}
