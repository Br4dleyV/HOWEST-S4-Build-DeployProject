using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;

namespace UnitTests.Application.Contracts.Data.Filters;

public sealed class MovieEventDataFiltersTests
{
    private static MovieEventData Event(DateTime showtime) => new()
    {
        Id = Guid.NewGuid(),
        MovieId = Guid.NewGuid(),
        RoomId = Guid.NewGuid(),
        Showtime = showtime.ToUniversalTime()
    };

    private static IReadOnlyList<MovieEventData> Apply(
        DateTime from, DateTime to, IEnumerable<MovieEventData> events)
    {
        var filter = MovieEventDataFilters.ByTimeRange(from, to).Compile();
        return events.Where(filter).ToList();
    }

    [Fact]
    public void ByTimeRange_EventWithinRange_IsIncluded()
    {
        var now = DateTime.UtcNow;
        var ev = Event(now.AddDays(1));
        var result = Apply(now, now.AddDays(14), [ev]);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_EventBeforeRange_IsExcluded()
    {
        var now = DateTime.UtcNow;
        var ev = Event(now.AddDays(-1));
        var result = Apply(now, now.AddDays(14), [ev]);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_EventAfterRange_IsExcluded()
    {
        var now = DateTime.UtcNow;
        var ev = Event(now.AddDays(15));
        var result = Apply(now, now.AddDays(14), [ev]);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_EventOnFromBoundary_IsIncluded()
    {
        var now = DateTime.UtcNow;
        var ev = Event(now);
        var result = Apply(now, now.AddDays(14), [ev]);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_EventOnToBoundary_IsIncluded()
    {
        var now = DateTime.UtcNow;
        var to = now.AddDays(14);
        var ev = Event(to);
        var result = Apply(now, to, [ev]);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_MultipleEvents_OnlyInRangeReturned()
    {
        var now = DateTime.UtcNow;
        var events = new[]
        {
            Event(now.AddDays(-1)),
            Event(now.AddDays(1)),
            Event(now.AddDays(7)),
            Event(now.AddDays(14)),
            Event(now.AddDays(15))
        };
        var result = Apply(now, now.AddDays(14), events);
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public void ByTimeRange_EmptyList_ReturnsEmpty()
    {
        var now = DateTime.UtcNow;
        var result = Apply(now, now.AddDays(14), []);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_LocalTimesAreConvertedToUtc()
    {
        var localFrom = DateTime.Now;
        var localTo = DateTime.Now.AddDays(14);
        var ev = Event(DateTime.UtcNow.AddDays(7));
        var result = Apply(localFrom, localTo, [ev]);
        Assert.Single(result);
    }
}
