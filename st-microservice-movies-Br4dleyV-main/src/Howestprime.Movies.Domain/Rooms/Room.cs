using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Rooms;

public readonly record struct RoomId(Guid Value) : IEntityId;

public sealed class Room : AggregateRoot<RoomId>
{
    public string Name { get; private set; } = string.Empty;
    public int Capacity { get; private set; }

    private Room() { }

    private Room(RoomId id, string name, int capacity) : base(id)
    {
        Name = name;
        Capacity = capacity;
    }

    public static Room Create(string name, int capacity, RoomId id)
    {
        Asserts.EnsureNotEmpty(name);
        Asserts.EnsureGreaterThan(capacity, 0);

        return new Room(id, name, capacity);
    }

    public override void ValidateState() { }
}
