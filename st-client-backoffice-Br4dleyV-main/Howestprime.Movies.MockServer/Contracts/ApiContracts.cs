namespace Howestprime.Movies.MockServer.Contracts;

public sealed class RegisterMovieBody
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int ReleaseYear { get; set; }

    public int Duration { get; set; }

    public IReadOnlyList<string> Genres { get; set; } = [];

    public IReadOnlyList<string> Actors { get; set; } = [];

    public int AgeRating { get; set; }

    public string PosterUrl { get; set; } = string.Empty;
}

public sealed class ScheduleMovieEventBody
{
    public Guid MovieId { get; set; }

    public Guid RoomId { get; set; }

    public DateTimeOffset Showtime { get; set; }
}
