namespace Howestprime.Movies.ApiClient.Responses;

public sealed class MovieEvent
{
    public Guid Id { get; set; }

    public Movie Movie { get; set; } = new();

    public Room Room { get; set; } = new();

    public DateTimeOffset Showtime { get; set; }

    public int Capacity { get; set; }

    public Guid EventId => Id;

    public Guid MovieId => Movie.Id;

    public string MovieTitle => Movie.Title;

    public string RoomName => Room.Name;

    public int RoomCapacity => Room.Capacity;
}
