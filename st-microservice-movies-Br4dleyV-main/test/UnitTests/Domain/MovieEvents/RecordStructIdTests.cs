using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.MovieEvents;

/// <summary>
/// Covers MovieEventId and RoomId record struct compiler-generated members.
/// </summary>
public sealed class RecordStructIdTests
{
    // ── MovieEventId ────────────────────────────────────────────────────────

    [Fact]
    public void MovieEventId_StoresValue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieEventId(guid);
        Assert.Equal(guid, id.Value);
    }

    [Fact]
    public void MovieEventId_Equality_SameGuid_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        Assert.Equal(new MovieEventId(guid), new MovieEventId(guid));
        Assert.True(new MovieEventId(guid) == new MovieEventId(guid));
        Assert.False(new MovieEventId(guid) != new MovieEventId(guid));
    }

    [Fact]
    public void MovieEventId_Equality_DifferentGuid_ReturnsFalse()
    {
        var first = new MovieEventId(Guid.NewGuid());
        var second = new MovieEventId(Guid.NewGuid());
        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void MovieEventId_GetHashCode_SameGuid_SameHash()
    {
        var guid = Guid.NewGuid();
        Assert.Equal(new MovieEventId(guid).GetHashCode(), new MovieEventId(guid).GetHashCode());
    }

    [Fact]
    public void MovieEventId_ToString_ContainsGuid()
    {
        var guid = Guid.NewGuid();
        var id = new MovieEventId(guid);
        Assert.Contains(guid.ToString(), id.ToString());
    }

    [Fact]
    public void MovieEventId_Equals_BoxedValue_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieEventId(guid);
        object boxed = new MovieEventId(guid);
        Assert.True(id.Equals(boxed));
    }

    [Fact]
    public void MovieEventId_Equals_DifferentType_ReturnsFalse()
    {
        var id = new MovieEventId(Guid.NewGuid());
        Assert.False(id.Equals((object)"not an id"));
    }

    [Fact]
    public void MovieEventId_With_CreatesModifiedCopy()
    {
        var original = new MovieEventId(Guid.NewGuid());
        var newGuid = Guid.NewGuid();
        var modified = original with { Value = newGuid };
        Assert.Equal(newGuid, modified.Value);
    }

    [Fact]
    public void MovieEventId_Deconstruct_ReturnsGuid()
    {
        var guid = Guid.NewGuid();
        var id = new MovieEventId(guid);
        id.Deconstruct(out Guid value);
        Assert.Equal(guid, value);
    }

    [Fact]
    public void MovieEventId_EntityId_New_IsNotEmpty()
    {
        var id = EntityId.New<MovieEventId>();
        Assert.NotEqual(Guid.Empty, id.Value);
    }

    // ── RoomId ──────────────────────────────────────────────────────────────

    [Fact]
    public void RoomId_StoresValue()
    {
        var guid = Guid.NewGuid();
        var id = new RoomId(guid);
        Assert.Equal(guid, id.Value);
    }

    [Fact]
    public void RoomId_Equality_SameGuid_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        Assert.Equal(new RoomId(guid), new RoomId(guid));
        Assert.True(new RoomId(guid) == new RoomId(guid));
        Assert.False(new RoomId(guid) != new RoomId(guid));
    }

    [Fact]
    public void RoomId_Equality_DifferentGuid_ReturnsFalse()
    {
        var first = new RoomId(Guid.NewGuid());
        var second = new RoomId(Guid.NewGuid());
        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void RoomId_GetHashCode_SameGuid_SameHash()
    {
        var guid = Guid.NewGuid();
        Assert.Equal(new RoomId(guid).GetHashCode(), new RoomId(guid).GetHashCode());
    }

    [Fact]
    public void RoomId_ToString_ContainsGuid()
    {
        var guid = Guid.NewGuid();
        var id = new RoomId(guid);
        Assert.Contains(guid.ToString(), id.ToString());
    }

    [Fact]
    public void RoomId_Equals_BoxedValue_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        var id = new RoomId(guid);
        object boxed = new RoomId(guid);
        Assert.True(id.Equals(boxed));
    }

    [Fact]
    public void RoomId_Equals_DifferentType_ReturnsFalse()
    {
        var id = new RoomId(Guid.NewGuid());
        Assert.False(id.Equals((object)"not an id"));
    }

    [Fact]
    public void RoomId_With_CreatesModifiedCopy()
    {
        var original = new RoomId(Guid.NewGuid());
        var newGuid = Guid.NewGuid();
        var modified = original with { Value = newGuid };
        Assert.Equal(newGuid, modified.Value);
    }

    [Fact]
    public void RoomId_Deconstruct_ReturnsGuid()
    {
        var guid = Guid.NewGuid();
        var id = new RoomId(guid);
        id.Deconstruct(out Guid value);
        Assert.Equal(guid, value);
    }

    [Fact]
    public void RoomId_EntityId_New_IsNotEmpty()
    {
        var id = EntityId.New<RoomId>();
        Assert.NotEqual(Guid.Empty, id.Value);
    }
}
