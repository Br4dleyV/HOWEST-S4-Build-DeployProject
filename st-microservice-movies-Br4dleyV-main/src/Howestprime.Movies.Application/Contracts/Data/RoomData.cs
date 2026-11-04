namespace Howestprime.Movies.Application.Contracts.Data;

/// <summary>
/// Represents the read model data of a cinema room.
/// </summary>
public sealed record RoomData
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Capacity { get; init; }
}
