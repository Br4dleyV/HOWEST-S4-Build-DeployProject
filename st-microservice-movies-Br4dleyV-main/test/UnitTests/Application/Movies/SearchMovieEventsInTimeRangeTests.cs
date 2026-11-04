using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Application.Movies;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq.Expressions;

namespace UnitTests.Application.Movies;

public sealed class SearchMovieEventsInTimeRangeTests
{
    private readonly FakeMovieEventQuery _fakeQuery;
    private readonly SearchMovieEventsInTimeRange _sut;

    public SearchMovieEventsInTimeRangeTests()
    {
        _fakeQuery = new FakeMovieEventQuery();
        _sut = new SearchMovieEventsInTimeRange(
            _fakeQuery, NullLogger<SearchMovieEventsInTimeRange>.Instance);
    }

    private static MovieEventData Event(DateTime showtime) => new()
    {
        Id = Guid.NewGuid(),
        MovieId = Guid.NewGuid(),
        RoomId = Guid.NewGuid(),
        Showtime = showtime.ToUniversalTime()
    };

    [Fact]
    public async Task Execute_Always_CallsFetch()
    {
        var input = new SearchMovieEventsInTimeRangeInput(DateTime.Now, DateTime.Now.AddDays(14));
        await _sut.Execute(input);
        Assert.True(_fakeQuery.FetchWasCalled);
    }

    [Fact]
    public async Task Execute_EventsWithinRange_ReturnsOnlyThose()
    {
        var now = DateTime.UtcNow;
        _fakeQuery.Events =
        [
            Event(now.AddDays(1)),
            Event(now.AddDays(7)),
            Event(now.AddDays(20))
        ];

        var input = new SearchMovieEventsInTimeRangeInput(now, now.AddDays(14));
        var result = await _sut.Execute(input);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Execute_NoEventsInRange_ReturnsEmptyList()
    {
        var now = DateTime.UtcNow;
        _fakeQuery.Events = [Event(now.AddDays(30))];

        var input = new SearchMovieEventsInTimeRangeInput(now, now.AddDays(14));
        var result = await _sut.Execute(input);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Execute_NullDates_FallsBackToNowWithoutThrowing()
    {
        _fakeQuery.Events = [];
        var input = new SearchMovieEventsInTimeRangeInput(null, null);
        var ex = await Record.ExceptionAsync(() => _sut.Execute(input));
        Assert.Null(ex);
    }

    [Fact]
    public async Task Execute_NullFrom_UsesCurrent()
    {
        _fakeQuery.Events = [Event(DateTime.UtcNow.AddHours(1))];
        var input = new SearchMovieEventsInTimeRangeInput(null, DateTime.Now.AddDays(14));
        var result = await _sut.Execute(input);
        Assert.Single(result);
    }

    [Fact]
    public async Task Execute_LocalTimesAreConvertedToUtc()
    {
        var now = DateTime.UtcNow;
        _fakeQuery.Events = [Event(now.AddDays(5))];

        // Pass local times — should still return the event
        var input = new SearchMovieEventsInTimeRangeInput(
            DateTime.Now,
            DateTime.Now.AddDays(14));

        var result = await _sut.Execute(input);
        Assert.Single(result);
    }

    private sealed class FakeMovieEventQuery : IMovieEventQuery
    {
        public bool FetchWasCalled { get; private set; }
        public IReadOnlyList<MovieEventData> Events { get; set; } = [];

        public Task<IReadOnlyList<MovieEventData>> Fetch(
            Expression<Func<MovieEventData, bool>> filter)
        {
            FetchWasCalled = true;
            var compiled = filter.Compile();
            IReadOnlyList<MovieEventData> result = Events.Where(compiled).ToList();
            return Task.FromResult(result);
        }
    }
}
