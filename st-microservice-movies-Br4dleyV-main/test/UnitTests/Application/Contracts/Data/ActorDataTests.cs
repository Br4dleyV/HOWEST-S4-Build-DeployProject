using Howestprime.Movies.Application.Contracts.Data;

namespace UnitTests.Application.Contracts.Data;

public sealed class ActorDataTests
{
    [Fact]
    public void ActorData_DefaultConstructor_SetsEmptyValue()
    {
        var actor = new ActorData();
        Assert.Equal(string.Empty, actor.Value);
    }

    [Fact]
    public void ActorData_WithValue_SetsCorrectValue()
    {
        var actor = new ActorData { Value = "Leonardo DiCaprio" };
        Assert.Equal("Leonardo DiCaprio", actor.Value);
    }

    [Fact]
    public void ActorData_Equals_SameValue_ReturnsTrue()
    {
        var first  = new ActorData { Value = "Tom Holland" };
        var second = new ActorData { Value = "Tom Holland" };
        Assert.Equal(first, second);
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void ActorData_Equals_DifferentValue_ReturnsFalse()
    {
        var first  = new ActorData { Value = "Tom Holland" };
        var second = new ActorData { Value = "Robert Downey Jr." };
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void ActorData_Equals_Null_ReturnsFalse()
    {
        var actor = new ActorData { Value = "Tom Holland" };
        Assert.False(actor.Equals(null));
    }

    [Fact]
    public void ActorData_GetHashCode_SameValue_ReturnsSameHash()
    {
        var first  = new ActorData { Value = "Tom Holland" };
        var second = new ActorData { Value = "Tom Holland" };
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void ActorData_With_CreatesModifiedCopy()
    {
        var original = new ActorData { Value = "Tom Holland" };
        var modified = original with { Value = "Zendaya" };
        Assert.Equal("Zendaya", modified.Value);
        Assert.Equal("Tom Holland", original.Value);
    }

    [Fact]
    public void ActorData_ToString_ContainsValue()
    {
        var actor = new ActorData { Value = "Heath Ledger" };
        Assert.Contains("Heath Ledger", actor.ToString());
    }
}
