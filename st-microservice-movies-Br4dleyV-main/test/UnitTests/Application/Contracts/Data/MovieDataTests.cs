using Howestprime.Movies.Application.Contracts.Data;

namespace UnitTests.Application.Contracts.Data;

public sealed class MovieDataTests
{
    [Fact]
    public void MovieData_DefaultConstructor_SetsDefaultValues()
    {
        // Act
        var movieData = new MovieData();

        // Assert
        Assert.Equal(Guid.Empty, movieData.Id);
        Assert.Equal(string.Empty, movieData.Title);
        Assert.Equal(string.Empty, movieData.Description);
        Assert.Equal(0, movieData.Duration);
        Assert.Empty(movieData.Genres);
        Assert.Equal(0, movieData.ReleaseYear);
        Assert.Empty(movieData.Actors);
        Assert.Equal(0, movieData.AgeRating);
        Assert.Equal(string.Empty, movieData.PosterUrl);
    }

    [Fact]
    public void MovieData_WithInitProperties_SetsCorrectValues()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var movieData = new MovieData
        {
            Id = id,
            Title = "Inception",
            Description = "A mind-bending thriller",
            Duration = 148,
            Genres = [new GenreData { Value = "Sci-Fi" }, new GenreData { Value = "Thriller" }],
            ReleaseYear = 2010,
            Actors = [new ActorData { Value = "Leonardo DiCaprio" }],
            AgeRating = 13,
            PosterUrl = "https://example.com/inception.jpg"
        };

        // Assert
        Assert.Equal(id, movieData.Id);
        Assert.Equal("Inception", movieData.Title);
        Assert.Equal("A mind-bending thriller", movieData.Description);
        Assert.Equal(148, movieData.Duration);
        Assert.Equal(2, movieData.Genres.Count);
        Assert.Contains(movieData.Genres, g => g.Value == "Sci-Fi");
        Assert.Contains(movieData.Genres, g => g.Value == "Thriller");
        Assert.Equal(2010, movieData.ReleaseYear);
        Assert.Single(movieData.Actors);
        Assert.Contains(movieData.Actors, a => a.Value == "Leonardo DiCaprio");
        Assert.Equal(13, movieData.AgeRating);
        Assert.Equal("https://example.com/inception.jpg", movieData.PosterUrl);
    }

    [Fact]
    public void MovieData_Equals_SameReference_ReturnsTrue()
    {
        // Arrange
        var movieData = new MovieData { Id = Guid.NewGuid(), Title = "Inception" };

        // Act & Assert
        Assert.True(movieData.Equals(movieData));
        Assert.True(movieData.Equals((object)movieData));
    }

    [Fact]
    public void MovieData_Equals_DifferentValues_ReturnsFalse()
    {
        // Arrange
        var first = new MovieData { Title = "Inception" };
        var second = new MovieData { Title = "The Dark Knight" };

        // Act & Assert
        Assert.NotEqual(first, second);
        Assert.False(first.Equals(second));
    }

    [Fact]
    public void MovieData_Equals_Null_ReturnsFalse()
    {
        // Arrange
        var movieData = new MovieData { Title = "Inception" };

        // Act & Assert
        Assert.False(movieData.Equals(null));
    }

    [Fact]
    public void MovieData_GetHashCode_SameInstance_ReturnsSameHash()
    {
        // Arrange
        var movieData = new MovieData { Id = Guid.NewGuid(), Title = "Inception" };

        // Act & Assert
        Assert.Equal(movieData.GetHashCode(), movieData.GetHashCode());
    }

    [Fact]
    public void MovieData_ToString_ReturnsNonEmpty()
    {
        // Arrange
        var movieData = new MovieData { Title = "Inception" };

        // Act
        var result = movieData.ToString();

        // Assert
        Assert.NotNull(result);
        Assert.Contains("Inception", result);
    }

    [Fact]
    public void MovieData_With_CreatesModifiedCopy()
    {
        // Arrange
        var original = new MovieData { Title = "Inception", Duration = 148 };

        // Act
        var modified = original with { Title = "The Dark Knight" };

        // Assert
        Assert.Equal("The Dark Knight", modified.Title);
        Assert.Equal(148, modified.Duration);
    }
}