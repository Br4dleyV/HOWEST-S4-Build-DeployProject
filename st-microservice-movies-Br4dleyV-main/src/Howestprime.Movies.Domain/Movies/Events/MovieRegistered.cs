namespace Howestprime.Movies.Domain.Movies.Events;

/// <summary>
/// Event raised when a new movie is registered.
/// </summary>
/// <param name="movieId">The ID of the registered movie.</param>
public sealed class MovieRegistered(
    MovieId movieId
) : MovieDomainEvent(nameof(MovieRegistered))
{
    public MovieId MovieId { get; private init; } = movieId;
}