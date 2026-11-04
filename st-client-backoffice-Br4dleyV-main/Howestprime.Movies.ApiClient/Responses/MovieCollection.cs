namespace Howestprime.Movies.ApiClient.Responses;

public sealed class MovieCollection
{
    public IReadOnlyList<Movie> Data { get; set; } = [];
}
