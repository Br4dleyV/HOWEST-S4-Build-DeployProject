namespace Howestprime.Movies.MockServer.Domain;

public sealed class MovieEntity
{
    public Guid Id { get; init; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int ReleaseYear { get; set; }

    public int Duration { get; set; }

    public List<string> Genres { get; set; } = [];

    public List<string> Actors { get; set; } = [];

    public int AgeRating { get; set; }

    public string PosterUrl { get; set; } = string.Empty;
}

public sealed class RoomEntity
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public int Capacity { get; init; }
}

public sealed class MovieEventEntity
{
    public Guid Id { get; init; }

    public Guid MovieId { get; init; }

    public Guid RoomId { get; init; }

    public DateTimeOffset Showtime { get; init; }

    public int TotalCapacity { get; set; }

    public int StandardVisitors { get; set; }

    public int DiscountVisitors { get; set; }

    public int BookedVisitors => StandardVisitors + DiscountVisitors;

    public int RemainingCapacity => TotalCapacity - BookedVisitors;
}

public enum ScheduleEventError
{
    None,
    MovieNotFound,
    RoomNotFound,
    Conflict
}
