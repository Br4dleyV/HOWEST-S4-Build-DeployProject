using Howestprime.Movies.Domain.Movies.ValueObjects;

namespace UnitTests.Domain.Movies;

public sealed class ValueObjectsTests
{
    [Fact]
    public void Title_Create_ValidValue_CreatesSuccessfully()
    {
        var title = Title.Create("Valid Title");
        Assert.Equal("Valid Title", title.Value);
        Assert.Equal("Valid Title", title.ToString());
    }

    [Fact]
    public void Title_Create_EmptyValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Title.Create(""));
    }

    [Fact]
    public void Description_Create_ValidValue_CreatesSuccessfully()
    {
        var desc = Description.Create("Valid Desc");
        Assert.Equal("Valid Desc", desc.Value);
        Assert.Equal("Valid Desc", desc.ToString());
    }

    [Fact]
    public void Description_Create_EmptyValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Description.Create(""));
    }

    [Fact]
    public void Duration_Create_ValidValue_CreatesSuccessfully()
    {
        var duration = Duration.Create(120);
        Assert.Equal(120, duration.Value);
        Assert.Equal("120", duration.ToString());
    }

    [Fact]
    public void Duration_Create_NegativeValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Duration.Create(-1));
    }

    [Fact]
    public void Duration_Create_InvalidValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Duration.Create(0));
    }

    [Fact]
    public void AgeRating_Create_ValidValue_CreatesSuccessfully()
    {
        var rating = AgeRating.Create(13);
        Assert.Equal(13, rating.Value);
        Assert.Equal("13", rating.ToString());
    }

    [Fact]
    public void AgeRating_Create_NullValue_CreatesSuccessfully()
    {
        var rating = AgeRating.Create(null);
        Assert.Null(rating.Value);
        Assert.Equal(string.Empty, rating.ToString());
    }

    [Fact]
    public void Actor_Create_ValidValue_CreatesSuccessfully()
    {
        var actor = Actor.Create("Tom Holland");
        Assert.Equal("Tom Holland", actor.Value);
        Assert.Equal("Tom Holland", actor.ToString());
    }

    [Fact]
    public void Actor_Create_EmptyValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Actor.Create(""));
    }

    [Fact]
    public void Genre_Create_ValidValue_CreatesSuccessfully()
    {
        var genre = Genre.Create("Action");
        Assert.Equal("Action", genre.Value);
        Assert.Equal("Action", genre.ToString());
    }

    [Fact]
    public void Genre_Create_EmptyValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Genre.Create(""));
    }

    [Fact]
    public void PosterUrl_Create_ValidValue_CreatesSuccessfully()
    {
        var url = PosterUrl.Create("http://example.com/poster.jpg");
        Assert.Equal("http://example.com/poster.jpg", url.Value);
        Assert.Equal("http://example.com/poster.jpg", url.ToString());
    }

    [Fact]
    public void PosterUrl_Create_NullValue_CreatesSuccessfully()
    {
        var url = PosterUrl.Create(null);
        Assert.Null(url.Value);
        Assert.Equal(string.Empty, url.ToString());
    }

    [Fact]
    public void ReleaseYear_Create_ValidValue_CreatesSuccessfully()
    {
        var targetYear = DateTime.Now.Year - 1;
        var year = ReleaseYear.Create(targetYear);

        Assert.Equal(targetYear, year.Value);
        Assert.Equal(targetYear.ToString(), year.ToString()); // ✅ this covers ToString()
    }

    [Fact]
    public void ReleaseYear_ToString_ReturnsYearAsString()
    {
        var targetYear = DateTime.Now.Year - 1;
        var year = ReleaseYear.Create(targetYear);

        Assert.Equal(targetYear.ToString(), year.ToString());
    }

    [Fact]
    public void ReleaseYear_Create_FutureValue_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => ReleaseYear.Create(DateTime.Now.Year + 1));
    }
}