using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq.Expressions;

namespace UnitTests.Application.Movies;

public sealed class SearchMovieCatalogTests
{
    private readonly FakeSearchMovieCatalogQuery _fakeQuery;
    private readonly SearchMovieCatalog _sut;

    public SearchMovieCatalogTests()
    {
        _fakeQuery = new FakeSearchMovieCatalogQuery();
        _sut = new SearchMovieCatalog(_fakeQuery, NullLogger<SearchMovieCatalog>.Instance);
    }

    [Fact]
    public async Task Execute_ManagerRole_DoesNotThrow()
    {
        var input = new SearchMovieCatalogInput("Spider", "", "Manager");
        var exception = await Record.ExceptionAsync(() => _sut.Execute(input));
        Assert.Null(exception);
    }

    [Theory]
    [InlineData("manager")]
    [InlineData("MANAGER")]
    [InlineData("Manager")]
    public async Task Execute_ManagerRoleCaseInsensitive_DoesNotThrow(string role)
    {
        var input = new SearchMovieCatalogInput("", "", role);
        var exception = await Record.ExceptionAsync(() => _sut.Execute(input));
        Assert.Null(exception);
    }

    // [Theory]
    // [InlineData("Customer")]
    // [InlineData("user")]
    // [InlineData("t")]
    // [InlineData("")]
    // [InlineData("admin")]
    // public async Task Execute_NonManagerRole_ThrowsUnauthorizedAccessException(string role)
    // {
    //     var input = new SearchMovieCatalogInput("", "", role);
    //     await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.Execute(input));
    // }

    [Fact]
    public async Task Execute_ManagerRole_CallsQueryFetch()
    {
        var input = new SearchMovieCatalogInput("", "", "Manager");
        await _sut.Execute(input);
        Assert.True(_fakeQuery.FetchWasCalled);
    }

    [Fact]
    public async Task Execute_ManagerRole_ReturnsMoviesFromQuery()
    {
        _fakeQuery.MoviesToReturn =
        [
            new MovieData { Title = "Spider-Man", Genres = [new GenreData { Value = "Action" }], Actors = [] },
            new MovieData { Title = "Inception",  Genres = [new GenreData { Value = "Sci-Fi" }],  Actors = [] }
        ];

        var input = new SearchMovieCatalogInput("", "", "Manager");
        var result = await _sut.Execute(input);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Execute_ManagerRole_EmptyFilters_ReturnsAllMovies()
    {
        _fakeQuery.MoviesToReturn =
        [
            new MovieData { Title = "Spider-Man", Genres = [], Actors = [] },
            new MovieData { Title = "Inception",  Genres = [], Actors = [] }
        ];

        var input = new SearchMovieCatalogInput("", "", "Manager");
        var result = await _sut.Execute(input);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Execute_ManagerRole_NoMoviesFound_ReturnsEmptyList()
    {
        _fakeQuery.MoviesToReturn = [];
        var input = new SearchMovieCatalogInput("NonExistent", "", "Manager");
        var result = await _sut.Execute(input);
        Assert.Empty(result);
    }

    private sealed class FakeSearchMovieCatalogQuery : ISearchMovieCatalogQuery
    {
        public bool FetchWasCalled { get; private set; }
        public IReadOnlyList<MovieData> MoviesToReturn { get; set; } = [];

        public Task<IReadOnlyList<MovieData>> Fetch(Expression<Func<MovieData, bool>> movieFilter)
        {
            FetchWasCalled = true;
            var compiled = movieFilter.Compile();
            IReadOnlyList<MovieData> result = MoviesToReturn.Where(compiled).ToList();
            return Task.FromResult(result);
        }
    }
}

public sealed class MovieDataFiltersTests
{
    private static MovieData Movie(string title, params string[] genres) => new()
    {
        Title = title,
        Genres = [.. genres.Select(g => new GenreData { Value = g })],
        Actors = []
    };

    private static IReadOnlyList<MovieData> Apply(
        string title, string genres, IEnumerable<MovieData> movies)
    {
        var filter = MovieDataFilters.ByTitleAndGenres(title, genres).Compile();
        return movies.Where(filter).ToList();
    }

    [Fact]
    public void ByTitleAndGenres_EmptyTitle_MatchesAllMovies()
    {
        var movies = new[] { Movie("Spider-Man"), Movie("Inception") };
        var result = Apply("", "", movies);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public void ByTitleAndGenres_TitlePartialMatch_ReturnsSingleMovie()
    {
        var movies = new[] { Movie("Spider-Man"), Movie("Inception") };
        var result = Apply("Spider", "", movies);
        Assert.Single(result);
        Assert.Equal("Spider-Man", result[0].Title);
    }

    [Fact]
    public void ByTitleAndGenres_TitleMatchCaseInsensitive_ReturnsMovie()
    {
        var movies = new[] { Movie("Spider-Man") };
        var result = Apply("spider", "", movies);
        Assert.Single(result);
    }

    [Fact]
    public void ByTitleAndGenres_TitleNoMatch_ReturnsEmpty()
    {
        var movies = new[] { Movie("Spider-Man"), Movie("Inception") };
        var result = Apply("Batman", "", movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTitleAndGenres_SingleGenreMatch_ReturnsMatchingMovies()
    {
        var movies = new[]
        {
            Movie("Spider-Man", "Action", "Sci-Fi"),
            Movie("Inception",  "Sci-Fi", "Thriller"),
            Movie("Rocky",      "Drama")
        };
        var result = Apply("", "Sci-Fi", movies);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public void ByTitleAndGenres_GenreMatchCaseInsensitive_ReturnsMovie()
    {
        var movies = new[] { Movie("Spider-Man", "Sci-Fi") };
        var result = Apply("", "sci-fi", movies);
        Assert.Single(result);
    }

    [Fact]
    public void ByTitleAndGenres_MultipleGenres_AllMustMatch()
    {
        var movies = new[]
        {
            Movie("Spider-Man", "Action", "Sci-Fi"),
            Movie("Inception",  "Sci-Fi", "Thriller")
        };
        var result = Apply("", "Action,Sci-Fi", movies);
        Assert.Single(result);
        Assert.Equal("Spider-Man", result[0].Title);
    }

    [Fact]
    public void ByTitleAndGenres_GenreNoMatch_ReturnsEmpty()
    {
        var movies = new[] { Movie("Spider-Man", "Action") };
        var result = Apply("", "Horror", movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTitleAndGenres_EmptyGenres_MatchesAllMovies()
    {
        var movies = new[] { Movie("Spider-Man", "Action"), Movie("Inception", "Sci-Fi") };
        var result = Apply("", "", movies);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public void ByTitleAndGenres_TitleAndGenreMatch_ReturnsCorrectMovie()
    {
        var movies = new[]
        {
            Movie("Spider-Man: No Way Home",   "Action", "Sci-Fi"),
            Movie("Spider-Man: Far From Home", "Action", "Thriller"),
            Movie("Inception",                 "Sci-Fi")
        };
        var result = Apply("Spider", "Sci-Fi", movies);
        Assert.Single(result);
        Assert.Equal("Spider-Man: No Way Home", result[0].Title);
    }

    [Fact]
    public void ByTitleAndGenres_TitleMatchButGenreMismatch_ReturnsEmpty()
    {
        var movies = new[] { Movie("Spider-Man", "Action") };
        var result = Apply("Spider", "Horror", movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTitleAndGenres_GenreMatchButTitleMismatch_ReturnsEmpty()
    {
        var movies = new[] { Movie("Spider-Man", "Action") };
        var result = Apply("Inception", "Action", movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTitleAndGenres_GenresStringWithExtraSpaces_TrimsCorrectly()
    {
        var movies = new[] { Movie("Spider-Man", "Sci-Fi") };
        var result = Apply("", " Sci-Fi ", movies);
        Assert.Single(result);
    }

    [Fact]
    public void ByTitleAndGenres_MultipleGenresOneNotMatched_ReturnsEmpty()
    {
        var movies = new[] { Movie("Spider-Man", "Sci-Fi") };
        var result = Apply("", " Sci-Fi , Action ", movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTitleAndGenres_EmptyMovieList_ReturnsEmpty()
    {
        var result = Apply("Spider", "Action", []);
        Assert.Empty(result);
    }
}
