namespace Howestprime.Movies.Domain.Movies.Events;

/// <summary>
/// Event raised when a new movie is registered.
/// </summary>
/// <param name="movie">The registered movie, captured as a snapshot for Ticketing.</param>
public sealed class MovieRegistered(
    Movie movie
) : MovieDomainEvent(nameof(MovieRegistered))
{
    public MovieId MovieId { get; } = movie.Id;
    public string Title { get; } = movie.Title.Value;
    public int DurationMinutes { get; } = movie.Duration.Value;
    public int ReleaseYear { get; } = movie.ReleaseYear.Value;
    public IReadOnlyList<string> Genres { get; } = movie.Genres.Select(genre => genre.Value).ToArray();
    public IReadOnlyList<string> Actors { get; } = movie.Actors.Select(actor => actor.Value).ToArray();
    public string AgeRating { get; } = movie.AgeRating.ToString();
    public string PosterUrl { get; } = movie.PosterUrl.ToString();
}
