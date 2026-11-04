using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Rooms;

public sealed class RoomTests
{
    [Fact]
    public void Create_ValidArguments_ReturnsRoom()
    {
        var id = EntityId.New<RoomId>();
        var room = Room.Create("Blue Room", 100, id);

        Assert.Equal("Blue Room", room.Name);
        Assert.Equal(100, room.Capacity);
        Assert.Equal(id, room.Id);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(50)]
    [InlineData(500)]
    public void Create_VariousCapacities_ReturnsRoom(int capacity)
    {
        var room = Room.Create("Room", capacity, EntityId.New<RoomId>());
        Assert.Equal(capacity, room.Capacity);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_EmptyName_ThrowsArgumentException(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Room.Create(name, 100, EntityId.New<RoomId>()));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Create_ZeroOrNegativeCapacity_ThrowsArgumentException(int capacity)
    {
        Assert.Throws<ArgumentException>(() =>
            Room.Create("Room", capacity, EntityId.New<RoomId>()));
    }

    [Fact]
    public void Create_BlueRoomWithFixedId_HasCorrectId()
    {
        var id = EntityId.New<RoomId>(Guid.Parse("019d059e-d220-71db-8a1a-ec7569492999"));
        var room = Room.Create("Blue Room", 100, id);
        Assert.Equal(Guid.Parse("019d059e-d220-71db-8a1a-ec7569492999"), room.Id.Value);
    }

    [Fact]
    public void Create_YellowRoomWithFixedId_HasCorrectId()
    {
        var id = EntityId.New<RoomId>(Guid.Parse("019d059e-d220-75fe-b936-0a97cd75216e"));
        var room = Room.Create("Yellow Room", 80, id);
        Assert.Equal(Guid.Parse("019d059e-d220-75fe-b936-0a97cd75216e"), room.Id.Value);
    }
}
