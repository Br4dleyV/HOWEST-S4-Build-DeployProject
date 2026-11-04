namespace Howestprime.Movies.ApiClient.Responses;

public sealed class Movie
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int ReleaseYear { get; set; }

    public int Duration { get; set; }

    public IReadOnlyList<string> Genres { get; set; } = [];

    public IReadOnlyList<string> Actors { get; set; } = [];

    public IReadOnlyList<DateTime> Showtimes { get; set; } = [];

    public string AgeRating { get; set; } = string.Empty;

    public string PosterUrl { get; set; } = string.Empty;
}
