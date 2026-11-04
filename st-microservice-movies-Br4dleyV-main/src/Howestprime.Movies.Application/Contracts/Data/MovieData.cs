namespace Howestprime.Movies.Application.Contracts.Data;

/// <summary>
/// Represents the data of a movie
/// </summary>
public sealed record MovieData
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int Duration { get; init; }
    public List<GenreData> Genres { get; init; } = [];
    public int ReleaseYear { get; init; }
    public List<ActorData> Actors { get; init; } = [];
    public int AgeRating { get; init; }
    public string PosterUrl { get; init; } = string.Empty;
}