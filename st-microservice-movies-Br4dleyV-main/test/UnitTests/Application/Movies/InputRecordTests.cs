using Howestprime.Movies.Application.Movies;

namespace UnitTests.Application.Movies;

/// <summary>
/// Tests for input record types — covers all compiler-generated members
/// (Equals, GetHashCode, ToString, ==, !=, with, Deconstruct, PrintMembers).
/// </summary>
public sealed class InputRecordTests
{
    // ── FindMovieByIdInput ──────────────────────────────────────────────────

    [Fact]
    public void FindMovieByIdInput_Properties_AreAccessible()
    {
        var movieId = Guid.NewGuid();
        var input = new FindMovieByIdInput(movieId, "Manager");

        Assert.Equal(movieId, input.MovieId);
        Assert.Equal("Manager", input.UserRole);
    }

    [Fact]
    public void FindMovieByIdInput_ToString_ContainsValues()
    {
        var movieId = Guid.NewGuid();
        var input = new FindMovieByIdInput(movieId, "Manager");
        var result = input.ToString();

        Assert.NotNull(result);
        Assert.Contains("Manager", result);
    }

    [Fact]
    public void FindMovieByIdInput_Equals_SameValues_ReturnsTrue()
    {
        var movieId = Guid.NewGuid();
        var first = new FindMovieByIdInput(movieId, "Manager");
        var second = new FindMovieByIdInput(movieId, "Manager");

        Assert.Equal(first, second);
        Assert.True(first == second);
        Assert.False(first != second);
    }

    [Fact]
    public void FindMovieByIdInput_Equals_DifferentValues_ReturnsFalse()
    {
        var first = new FindMovieByIdInput(Guid.NewGuid(), "Manager");
        var second = new FindMovieByIdInput(Guid.NewGuid(), "Manager");

        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void FindMovieByIdInput_Equals_Null_ReturnsFalse()
    {
        var input = new FindMovieByIdInput(Guid.NewGuid(), "Manager");
        Assert.False(input.Equals(null));
    }

    [Fact]
    public void FindMovieByIdInput_Equals_Object_SameValues_ReturnsTrue()
    {
        var movieId = Guid.NewGuid();
        var first = new FindMovieByIdInput(movieId, "Manager");
        object second = new FindMovieByIdInput(movieId, "Manager");
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void FindMovieByIdInput_GetHashCode_SameValues_SameHash()
    {
        var movieId = Guid.NewGuid();
        var first = new FindMovieByIdInput(movieId, "Manager");
        var second = new FindMovieByIdInput(movieId, "Manager");

        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void FindMovieByIdInput_With_CreatesModifiedCopy()
    {
        var movieId = Guid.NewGuid();
        var original = new FindMovieByIdInput(movieId, "Manager");
        var modified = original with { UserRole = "Customer" };

        Assert.Equal(movieId, modified.MovieId);
        Assert.Equal("Customer", modified.UserRole);
        Assert.Equal("Manager", original.UserRole);
    }

    [Fact]
    public void FindMovieByIdInput_Deconstruct_ReturnsCorrectValues()
    {
        var movieId = Guid.NewGuid();
        var input = new FindMovieByIdInput(movieId, "Manager");
        input.Deconstruct(out Guid id, out string role);

        Assert.Equal(movieId, id);
        Assert.Equal("Manager", role);
    }

    // ── SearchMovieCatalogInput ─────────────────────────────────────────────

    [Fact]
    public void SearchMovieCatalogInput_Properties_AreAccessible()
    {
        var input = new SearchMovieCatalogInput("Spider", "Action", "Manager");

        Assert.Equal("Spider", input.Title);
        Assert.Equal("Action", input.Genres);
        Assert.Equal("Manager", input.UserRole);
    }

    [Fact]
    public void SearchMovieCatalogInput_ToString_ContainsValues()
    {
        var input = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        var result = input.ToString();

        Assert.NotNull(result);
        Assert.Contains("Spider", result);
    }

    [Fact]
    public void SearchMovieCatalogInput_Equals_SameValues_ReturnsTrue()
    {
        var first = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        var second = new SearchMovieCatalogInput("Spider", "Action", "Manager");

        Assert.Equal(first, second);
        Assert.True(first == second);
        Assert.False(first != second);
    }

    [Fact]
    public void SearchMovieCatalogInput_Equals_DifferentValues_ReturnsFalse()
    {
        var first = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        var second = new SearchMovieCatalogInput("Batman", "Action", "Manager");

        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void SearchMovieCatalogInput_Equals_Null_ReturnsFalse()
    {
        var input = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        Assert.False(input.Equals(null));
    }

    [Fact]
    public void SearchMovieCatalogInput_Equals_Object_SameValues_ReturnsTrue()
    {
        var first = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        object second = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void SearchMovieCatalogInput_GetHashCode_SameValues_SameHash()
    {
        var first = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        var second = new SearchMovieCatalogInput("Spider", "Action", "Manager");

        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void SearchMovieCatalogInput_With_CreatesModifiedCopy()
    {
        var original = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        var modified = original with { Title = "Batman" };

        Assert.Equal("Batman", modified.Title);
        Assert.Equal("Action", modified.Genres);
        Assert.Equal("Spider", original.Title);
    }

    [Fact]
    public void SearchMovieCatalogInput_Deconstruct_ReturnsCorrectValues()
    {
        var input = new SearchMovieCatalogInput("Spider", "Action", "Manager");
        input.Deconstruct(out string title, out string genres, out string role);

        Assert.Equal("Spider", title);
        Assert.Equal("Action", genres);
        Assert.Equal("Manager", role);
    }

    // ── RegisterMovieInput ──────────────────────────────────────────────────

    [Fact]
    public void RegisterMovieInput_Properties_AreAccessible()
    {
        var genres = new[] { "Action" };
        var actors = new[] { "Tom Holland" };
        var input = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");

        Assert.Equal("Inception", input.Title);
        Assert.Equal("A thriller", input.Description);
        Assert.Equal(148, input.Duration);
        Assert.Equal(2010, input.ReleaseYear);
        Assert.Equal(13, input.AgeRating);
        Assert.Equal("https://example.com/poster.jpg", input.PosterUrl);
        Assert.Equal(genres, input.Genres);
        Assert.Equal(actors, input.Actors);
    }

    [Fact]
    public void RegisterMovieInput_ToString_ContainsTitle()
    {
        var input = new RegisterMovieInput("Inception", "A thriller", 148, ["Action"], 2010, ["Tom Holland"], 13, "https://example.com/poster.jpg");
        var result = input.ToString();

        Assert.NotNull(result);
        Assert.Contains("Inception", result);
    }

    [Fact]
    public void RegisterMovieInput_Equals_SameValues_ReturnsTrue()
    {
        var genres = new[] { "Action" };
        var actors = new[] { "Tom Holland" };
        var first = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");
        var second = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");

        Assert.Equal(first, second);
        Assert.True(first == second);
    }

    [Fact]
    public void RegisterMovieInput_Equals_DifferentValues_ReturnsFalse()
    {
        var first = new RegisterMovieInput("Inception", "A thriller", 148, ["Action"], 2010, ["Tom Holland"], 13, "https://poster.jpg");
        var second = new RegisterMovieInput("The Dark Knight", "A thriller", 148, ["Action"], 2010, ["Tom Holland"], 13, "https://poster.jpg");

        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void RegisterMovieInput_Equals_Null_ReturnsFalse()
    {
        var input = new RegisterMovieInput("Inception", "A thriller", 148, ["Action"], 2010, ["Tom Holland"], 13, "https://example.com/poster.jpg");
        Assert.False(input.Equals(null));
    }

    [Fact]
    public void RegisterMovieInput_Equals_Object_SameValues_ReturnsTrue()
    {
        var genres = new[] { "Action" };
        var actors = new[] { "Tom Holland" };
        var first = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");
        object second = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void RegisterMovieInput_GetHashCode_SameValues_SameHash()
    {
        var genres = new[] { "Action" };
        var actors = new[] { "Tom Holland" };
        var first = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");
        var second = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");

        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void RegisterMovieInput_With_CreatesModifiedCopy()
    {
        var original = new RegisterMovieInput("Inception", "A thriller", 148, ["Action"], 2010, ["Tom Holland"], 13, "https://example.com/poster.jpg");
        var modified = original with { Title = "The Dark Knight" };

        Assert.Equal("The Dark Knight", modified.Title);
        Assert.Equal("A thriller", modified.Description);
        Assert.Equal("Inception", original.Title);
    }

    [Fact]
    public void RegisterMovieInput_Deconstruct_ReturnsCorrectValues()
    {
        var genres = new[] { "Action" };
        var actors = new[] { "Tom Holland" };
        var input = new RegisterMovieInput("Inception", "A thriller", 148, genres, 2010, actors, 13, "https://example.com/poster.jpg");

        input.Deconstruct(
            out string title,
            out string description,
            out int duration,
            out IEnumerable<string> g,
            out int releaseYear,
            out IEnumerable<string> a,
            out int ageRating,
            out string posterUrl
        );

        Assert.Equal("Inception", title);
        Assert.Equal("A thriller", description);
        Assert.Equal(148, duration);
        Assert.Equal(2010, releaseYear);
        Assert.Equal(13, ageRating);
        Assert.Equal("https://example.com/poster.jpg", posterUrl);
        Assert.Equal(genres, g);
        Assert.Equal(actors, a);
    }
}
