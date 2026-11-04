namespace Howestprime.Movies.ApiClient.Requests;

public sealed class SearchMovieCatalogRequest
{
    public string UserRole { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string? Genres { get; set; }
}
