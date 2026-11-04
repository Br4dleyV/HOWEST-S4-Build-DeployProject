namespace Howestprime.Movies.Application.Contracts.Data;

/// <summary>
/// Represents the read model data of a scheduled movie event.
/// </summary>
public sealed record MovieEventData
{
    public Guid Id { get; init; }
    public Guid MovieId { get; init; }
    public Guid RoomId { get; init; }
    public DateTime Showtime { get; init; }
}
