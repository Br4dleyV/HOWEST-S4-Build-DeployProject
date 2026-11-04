using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.Movies;

/// <summary>
/// Tests for MovieId record struct — covers all compiler-generated members
/// (Equals, GetHashCode, ToString, ==, !=, with, Deconstruct).
/// </summary>
public sealed class MovieIdTests
{
    [Fact]
    public void MovieId_WithGuid_StoresValue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieId(guid);
        Assert.Equal(guid, id.Value);
    }

    [Fact]
    public void MovieId_Equality_SameGuid_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        var first = new MovieId(guid);
        var second = new MovieId(guid);
        Assert.Equal(first, second);
        Assert.True(first == second);
        Assert.False(first != second);
    }

    [Fact]
    public void MovieId_Equality_DifferentGuid_ReturnsFalse()
    {
        var first = new MovieId(Guid.NewGuid());
        var second = new MovieId(Guid.NewGuid());
        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void MovieId_GetHashCode_SameGuid_SameHash()
    {
        var guid = Guid.NewGuid();
        var first = new MovieId(guid);
        var second = new MovieId(guid);
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void MovieId_ToString_ContainsGuidValue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieId(guid);
        Assert.Contains(guid.ToString(), id.ToString());
    }

    [Fact]
    public void MovieId_Equals_BoxedValue_ReturnsTrue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieId(guid);
        object boxed = new MovieId(guid);
        Assert.True(id.Equals(boxed));
    }

    [Fact]
    public void MovieId_Equals_DifferentType_ReturnsFalse()
    {
        var id = new MovieId(Guid.NewGuid());
        object other = "not a MovieId";
        Assert.False(id.Equals(other));
    }

    [Fact]
    public void MovieId_EntityId_New_CreatesValidMovieId()
    {
        var id = EntityId.New<MovieId>();
        Assert.NotEqual(Guid.Empty, id.Value);
    }

    [Fact]
    public void MovieId_With_CreatesModifiedCopy()
    {
        var original = new MovieId(Guid.NewGuid());
        var newGuid = Guid.NewGuid();
        var modified = original with { Value = newGuid };
        Assert.Equal(newGuid, modified.Value);
        Assert.NotEqual(original.Value, modified.Value);
    }

    [Fact]
    public void MovieId_Deconstruct_ReturnsGuidValue()
    {
        var guid = Guid.NewGuid();
        var id = new MovieId(guid);
        // Positional deconstruct via pattern: (Guid value) = id
        id.Deconstruct(out Guid deconstructed);
        Assert.Equal(guid, deconstructed);
    }
}
