using Howestprime.Movies.Application.Contracts.Data;

namespace UnitTests.Application.Contracts.Data;

public sealed class GenreDataTests
{
    [Fact]
    public void GenreData_DefaultConstructor_SetsEmptyValue()
    {
        var genre = new GenreData();
        Assert.Equal(string.Empty, genre.Value);
    }

    [Fact]
    public void GenreData_WithValue_SetsCorrectValue()
    {
        var genre = new GenreData { Value = "Sci-Fi" };
        Assert.Equal("Sci-Fi", genre.Value);
    }

    [Fact]
    public void GenreData_Equals_SameValue_ReturnsTrue()
    {
        var first  = new GenreData { Value = "Action" };
        var second = new GenreData { Value = "Action" };
        Assert.Equal(first, second);
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void GenreData_Equals_DifferentValue_ReturnsFalse()
    {
        var first  = new GenreData { Value = "Action" };
        var second = new GenreData { Value = "Drama" };
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void GenreData_Equals_Null_ReturnsFalse()
    {
        var genre = new GenreData { Value = "Action" };
        Assert.False(genre.Equals(null));
    }

    [Fact]
    public void GenreData_GetHashCode_SameValue_ReturnsSameHash()
    {
        var first  = new GenreData { Value = "Action" };
        var second = new GenreData { Value = "Action" };
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void GenreData_With_CreatesModifiedCopy()
    {
        var original = new GenreData { Value = "Action" };
        var modified = original with { Value = "Drama" };
        Assert.Equal("Drama", modified.Value);
        Assert.Equal("Action", original.Value);
    }

    [Fact]
    public void GenreData_ToString_ContainsValue()
    {
        var genre = new GenreData { Value = "Thriller" };
        Assert.Contains("Thriller", genre.ToString());
    }
}
