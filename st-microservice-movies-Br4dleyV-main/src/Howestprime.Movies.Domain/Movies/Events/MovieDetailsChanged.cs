namespace Howestprime.Movies.Domain.Movies.Events;

/// <summary>
/// Event raised when the details of a movie are changed.
/// </summary>
/// <param name="movieId">The ID of the movie whose details changed.</param>
public sealed class MovieDetailsChanged(
    MovieId movieId
) : MovieDomainEvent(nameof(MovieDetailsChanged))
{
    public MovieId MovieId { get; private init; } = movieId;
}
