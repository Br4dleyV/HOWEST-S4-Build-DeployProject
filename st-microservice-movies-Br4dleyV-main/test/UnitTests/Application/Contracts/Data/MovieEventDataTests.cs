using Howestprime.Movies.Application.Contracts.Data;
using Howestprime.Movies.Application.Contracts.Data.Filters;

namespace UnitTests.Application.Contracts.Data;

public sealed class MovieEventDataTests
{
    [Fact]
    public void MovieEventData_DefaultConstructor_SetsDefaults()
    {
        var data = new MovieEventData();
        Assert.Equal(Guid.Empty, data.Id);
        Assert.Equal(Guid.Empty, data.MovieId);
        Assert.Equal(Guid.Empty, data.RoomId);
        Assert.Equal(default, data.Showtime);
    }

    [Fact]
    public void MovieEventData_WithValues_SetsCorrectly()
    {
        var id      = Guid.NewGuid();
        var movieId = Guid.NewGuid();
        var roomId  = Guid.NewGuid();
        var time    = new DateTime(2099, 6, 15, 15, 0, 0, DateTimeKind.Utc);

        var data = new MovieEventData { Id = id, MovieId = movieId, RoomId = roomId, Showtime = time };

        Assert.Equal(id,      data.Id);
        Assert.Equal(movieId, data.MovieId);
        Assert.Equal(roomId,  data.RoomId);
        Assert.Equal(time,    data.Showtime);
    }

    [Fact]
    public void MovieEventData_Equals_SameValues_ReturnsTrue()
    {
        var id = Guid.NewGuid();
        var first  = new MovieEventData { Id = id };
        var second = new MovieEventData { Id = id };
        Assert.Equal(first, second);
    }

    [Fact]
    public void MovieEventData_Equals_DifferentValues_ReturnsFalse()
    {
        var first  = new MovieEventData { Id = Guid.NewGuid() };
        var second = new MovieEventData { Id = Guid.NewGuid() };
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void MovieEventData_GetHashCode_SameValues_SameHash()
    {
        var id = Guid.NewGuid();
        var first  = new MovieEventData { Id = id };
        var second = new MovieEventData { Id = id };
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void MovieEventData_With_CreatesModifiedCopy()
    {
        var original = new MovieEventData { Id = Guid.NewGuid() };
        var newId    = Guid.NewGuid();
        var modified = original with { Id = newId };
        Assert.Equal(newId,       modified.Id);
        Assert.Equal(original.MovieId, modified.MovieId);
        Assert.NotEqual(original.Id, modified.Id);
    }

    [Fact]
    public void MovieEventData_ToString_ContainsTypeName()
    {
        var data   = new MovieEventData { Id = Guid.NewGuid() };
        var result = data.ToString();
        Assert.NotNull(result);
        Assert.Contains("MovieEventData", result);
    }
}

public sealed class RoomDataTests
{
    [Fact]
    public void RoomData_DefaultConstructor_SetsDefaults()
    {
        var data = new RoomData();
        Assert.Equal(Guid.Empty, data.Id);
        Assert.Equal(string.Empty, data.Name);
        Assert.Equal(0, data.Capacity);
    }

    [Fact]
    public void RoomData_WithValues_SetsCorrectly()
    {
        var id   = Guid.NewGuid();
        var data = new RoomData { Id = id, Name = "Blue Room", Capacity = 100 };
        Assert.Equal(id,          data.Id);
        Assert.Equal("Blue Room", data.Name);
        Assert.Equal(100,         data.Capacity);
    }

    [Fact]
    public void RoomData_Equals_SameValues_ReturnsTrue()
    {
        var id     = Guid.NewGuid();
        var first  = new RoomData { Id = id, Name = "Blue Room", Capacity = 100 };
        var second = new RoomData { Id = id, Name = "Blue Room", Capacity = 100 };
        Assert.Equal(first, second);
    }

    [Fact]
    public void RoomData_Equals_DifferentValues_ReturnsFalse()
    {
        var first  = new RoomData { Id = Guid.NewGuid(), Name = "Blue Room",   Capacity = 100 };
        var second = new RoomData { Id = Guid.NewGuid(), Name = "Yellow Room", Capacity = 80  };
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void RoomData_GetHashCode_SameValues_SameHash()
    {
        var id     = Guid.NewGuid();
        var first  = new RoomData { Id = id, Name = "Blue Room", Capacity = 100 };
        var second = new RoomData { Id = id, Name = "Blue Room", Capacity = 100 };
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void RoomData_With_CreatesModifiedCopy()
    {
        var original = new RoomData { Id = Guid.NewGuid(), Name = "Blue Room", Capacity = 100 };
        var modified = original with { Name = "Yellow Room", Capacity = 80 };
        Assert.Equal("Yellow Room", modified.Name);
        Assert.Equal(80,            modified.Capacity);
        Assert.Equal("Blue Room",   original.Name);
    }

    [Fact]
    public void RoomData_ToString_ContainsTypeName()
    {
        var data   = new RoomData { Id = Guid.NewGuid(), Name = "Blue Room" };
        var result = data.ToString();
        Assert.NotNull(result);
        Assert.Contains("RoomData", result);
    }
}

public sealed class MovieEventDataFiltersTests
{
    private static MovieEventData Event(DateTime showtime) => new()
    {
        Id      = Guid.NewGuid(),
        MovieId = Guid.NewGuid(),
        RoomId  = Guid.NewGuid(),
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
        var now    = DateTime.UtcNow;
        var events = new[] { Event(now.AddDays(5)) };
        var result = Apply(now, now.AddDays(14), events);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_EventBeforeRange_IsExcluded()
    {
        var now    = DateTime.UtcNow;
        var events = new[] { Event(now.AddDays(-1)) };
        var result = Apply(now, now.AddDays(14), events);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_EventAfterRange_IsExcluded()
    {
        var now    = DateTime.UtcNow;
        var events = new[] { Event(now.AddDays(20)) };
        var result = Apply(now, now.AddDays(14), events);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_EventOnFromBoundary_IsIncluded()
    {
        var from   = DateTime.UtcNow.AddDays(1);
        var events = new[] { Event(from) };
        var result = Apply(from, from.AddDays(14), events);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_EventOnToBoundary_IsIncluded()
    {
        var from   = DateTime.UtcNow;
        var to     = from.AddDays(14);
        var events = new[] { Event(to) };
        var result = Apply(from, to, events);
        Assert.Single(result);
    }

    [Fact]
    public void ByTimeRange_MultipleEvents_ReturnsOnlyInRange()
    {
        var now = DateTime.UtcNow;
        var events = new[]
        {
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
        var now    = DateTime.UtcNow;
        var result = Apply(now, now.AddDays(14), []);
        Assert.Empty(result);
    }

    [Fact]
    public void ByTimeRange_LocalTimesAreConvertedToUtc()
    {
        // Pass local DateTime — should still match a UTC event in range
        var localFrom  = DateTime.Now;
        var localTo    = DateTime.Now.AddDays(14);
        var utcEvent   = Event(DateTime.UtcNow.AddDays(5));
        var result     = Apply(localFrom, localTo, [utcEvent]);
        Assert.Single(result);
    }
}
