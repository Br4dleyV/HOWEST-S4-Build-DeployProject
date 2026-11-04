using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq.Expressions;

namespace UnitTests.Application.Movies;

public sealed class FindMovieByIdTests
{
    private readonly FakeSearchMovieCatalogQuery _fakeQuery;
    private readonly FindMovieById _sut;

    public FindMovieByIdTests()
    {
        _fakeQuery = new FakeSearchMovieCatalogQuery();
        _sut = new FindMovieById(_fakeQuery, NullLogger<FindMovieById>.Instance);
    }

    [Theory]
    [InlineData("manager")]
    [InlineData("MANAGER")]
    [InlineData("Manager")]
    public async Task Execute_ManagerRole_DoesNotThrow(string role)
    {
        var id = Guid.NewGuid();
        _fakeQuery.MoviesToReturn = [new MovieData { Id = id, Genres = [], Actors = [] }];
        var input = new FindMovieByIdInput(id, role);
        var exception = await Record.ExceptionAsync(() => _sut.Execute(input));
        Assert.Null(exception);
    }

    // [Theory]
    // [InlineData("Customer")]
    // [InlineData("user")]
    // [InlineData("")]
    // [InlineData("admin")]
    // public async Task Execute_NonManagerRole_ThrowsUnauthorizedAccessException(string role)
    // {
    //     var input = new FindMovieByIdInput(Guid.NewGuid(), role);
    //     await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.Execute(input));
    // }

    [Fact]
    public async Task Execute_ExistingId_ReturnsCorrectMovie()
    {
        var id = Guid.NewGuid();
        var expected = new MovieData
        {
            Id = id,
            Title = "Inception",
            Description = "A mind-bending thriller",
            Duration = 148,
            ReleaseYear = 2010,
            AgeRating = 13,
            PosterUrl = "https://example.com/inception.jpg",
            Genres = [new GenreData { Value = "Sci-Fi" }],
            Actors = [new ActorData { Value = "Leonardo DiCaprio" }]
        };
        _fakeQuery.MoviesToReturn = [expected];

        var result = await _sut.Execute(new FindMovieByIdInput(id, "Manager"));

        Assert.Equal(id, result.Id);
        Assert.Equal("Inception", result.Title);
        Assert.Single(result.Genres);
        Assert.Single(result.Actors);
    }

    [Fact]
    public async Task Execute_ExistingId_CallsQueryFetch()
    {
        var id = Guid.NewGuid();
        _fakeQuery.MoviesToReturn = [new MovieData { Id = id, Genres = [], Actors = [] }];
        await _sut.Execute(new FindMovieByIdInput(id, "Manager"));
        Assert.True(_fakeQuery.FetchWasCalled);
    }

    [Fact]
    public async Task Execute_NonExistingId_ThrowsKeyNotFoundException()
    {
        _fakeQuery.MoviesToReturn = [];
        var input = new FindMovieByIdInput(Guid.NewGuid(), "Manager");
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(input));
    }

    [Fact]
    public async Task Execute_WrongId_DoesNotReturnOtherMovie()
    {
        _fakeQuery.MoviesToReturn =
        [
            new MovieData { Id = Guid.NewGuid(), Title = "Other Movie", Genres = [], Actors = [] }
        ];
        var input = new FindMovieByIdInput(Guid.NewGuid(), "Manager");
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.Execute(input));
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

public sealed class MovieDataFiltersByIdTests
{
    private static MovieData Movie(Guid id, string title = "Test") => new()
    {
        Id = id,
        Title = title,
        Genres = [],
        Actors = []
    };

    private static IReadOnlyList<MovieData> Apply(Guid id, IEnumerable<MovieData> movies)
    {
        var filter = MovieDataFilters.ById(id).Compile();
        return movies.Where(filter).ToList();
    }

    [Fact]
    public void ById_ExistingId_ReturnsSingleMovie()
    {
        var id = Guid.NewGuid();
        var movies = new[] { Movie(id, "Inception"), Movie(Guid.NewGuid(), "Spider-Man") };
        var result = Apply(id, movies);
        Assert.Single(result);
        Assert.Equal("Inception", result[0].Title);
    }

    [Fact]
    public void ById_NonExistingId_ReturnsEmpty()
    {
        var movies = new[] { Movie(Guid.NewGuid()), Movie(Guid.NewGuid()) };
        var result = Apply(Guid.NewGuid(), movies);
        Assert.Empty(result);
    }

    [Fact]
    public void ById_EmptyMovieList_ReturnsEmpty()
    {
        var result = Apply(Guid.NewGuid(), []);
        Assert.Empty(result);
    }

    [Fact]
    public void ById_MatchesOnlyExactId()
    {
        var targetId = Guid.NewGuid();
        var movies = new[]
        {
            Movie(targetId,    "Target Movie"),
            Movie(Guid.NewGuid(), "Other Movie 1"),
            Movie(Guid.NewGuid(), "Other Movie 2")
        };
        var result = Apply(targetId, movies);
        Assert.Single(result);
        Assert.Equal("Target Movie", result[0].Title);
    }
}
