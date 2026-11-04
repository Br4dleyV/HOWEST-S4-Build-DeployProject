using Howestprime.Movies.Domain.Movies.Events;
using Howestprime.Movies.Domain.Movies.ValueObjects;
using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies;

/// <summary>
/// Represents a unique identifier for a movie.
/// </summary>
/// <param name="Value">The GUID value that uniquely identifies the movie.</param>
public readonly record struct MovieId(Guid Value) : IEntityId;

public sealed class Movie : AggregateRoot<MovieId>
{
    public Title Title { get; private set; }
    public Description Description { get; private set; }
    public ReleaseYear ReleaseYear { get; private set; }

    public Duration Duration { get; private set; }
    public AgeRating AgeRating { get; private set; }
    public PosterUrl PosterUrl { get; private set; }

    public IReadOnlyList<Genre> Genres => _genres.AsReadOnly();
    private readonly List<Genre> _genres = [];

    public IReadOnlyList<Actor> Actors => _actors.AsReadOnly();
    private readonly List<Actor> _actors = [];

    // Needed for EF Core binding
    private Movie(
        MovieId id,
        Title title,
        Description description,
        Duration duration,
        ReleaseYear releaseYear,
        AgeRating ageRating,
        PosterUrl posterUrl) : base(id)
    {
        Title = title;
        Description = description;
        Duration = duration;
        ReleaseYear = releaseYear;
        AgeRating = ageRating;
        PosterUrl = posterUrl;
    }

    private Movie(
        MovieId id,
        Title title,
        Description description,
        Duration duration,
        ReleaseYear releaseYear,
        AgeRating ageRating,
        PosterUrl posterUrl,
        IEnumerable<Genre> genres,
        IEnumerable<Actor> actors) : this(id, title, description, duration, releaseYear, ageRating, posterUrl)
    {
        _genres.AddRange(genres);
        _actors.AddRange(actors);
    }

    /// <summary>
    /// Registers a new movie. Also raises a domain event to signal that the movie has been registered.
    /// </summary>
    /// <param name="id">The ID to assign to the new movie.</param>
    /// <param name="title">The title of the movie.</param>
    /// <param name="description">The description of the movie.</param>
    /// <param name="duration">The duration of the movie.</param>
    /// <param name="releaseYear">The year the movie was released.</param>
    /// <param name="ageRating">The age rating assigned to the movie.</param>
    /// <param name="posterUrl">The Poster URL of the movie.</param>
    /// <param name="genres">A collection of genres that categorize the movie.</param>
    /// <param name="actors">A collection of actors who performed in the movie.</param>
    /// <returns>A new instance of the Movie class representing the registered movie.</returns>
    public static Movie Register(
        MovieId id,
        Title title,
        Description description,
        Duration duration,
        ReleaseYear releaseYear,
        AgeRating ageRating,
        PosterUrl posterUrl,
        IEnumerable<Genre> genres,
        IEnumerable<Actor> actors)
    {
        Movie movie = new(id, title, description, duration, releaseYear, ageRating, posterUrl, genres, actors);

        movie.RaiseDomainEvent(
            new MovieRegistered(
                movie.Id
            )
        );
        return movie;
    }

    /// <summary>
    /// Change the details of a movie aggregate and raise a MovieDetailsChanged domain event.
    /// </summary>
    public void ChangeDetails(
        Title title,
        Description description,
        Duration duration,
        ReleaseYear releaseYear,
        AgeRating ageRating,
        PosterUrl posterUrl,
        IEnumerable<Genre> genres,
        IEnumerable<Actor> actors)
    {
        Title = title;
        Description = description;
        Duration = duration;
        ReleaseYear = releaseYear;
        AgeRating = ageRating;
        PosterUrl = posterUrl;

        _genres.Clear();
        _genres.AddRange(genres);

        _actors.Clear();
        _actors.AddRange(actors);

        RaiseDomainEvent(new MovieDetailsChanged(this.Id));
    }

    public override void ValidateState()
    {
    }
}