using Howestprime.Movies.Domain.MovieEvents;

namespace UnitTests.Domain.MovieEvents;

public sealed class MovieEventAssertsTests
{
    [Theory]
    [InlineData(15)]
    [InlineData(19)]
    public void EnsureShowtimeIsAt15hOr19h_ValidHour_DoesNotThrow(int hour)
    {
        var time = new DateTime(2099, 1, 1, hour, 0, 0);
        var ex = Record.Exception(() => MovieEventAsserts.EnsureShowtimeIsAt15hOr19h(time));
        Assert.Null(ex);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(14)]
    [InlineData(16)]
    [InlineData(18)]
    [InlineData(20)]
    [InlineData(23)]
    public void EnsureShowtimeIsAt15hOr19h_InvalidHour_ThrowsArgumentException(int hour)
    {
        var time = new DateTime(2099, 1, 1, hour, 0, 0);
        Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureShowtimeIsAt15hOr19h(time));
    }

    [Fact]
    public void EnsureShowtimeIsInTheFuture_FutureTime_DoesNotThrow()
    {
        var future = DateTime.Now.AddDays(1);
        var ex = Record.Exception(() => MovieEventAsserts.EnsureShowtimeIsInTheFuture(future));
        Assert.Null(ex);
    }

    [Fact]
    public void EnsureShowtimeIsInTheFuture_PastTime_ThrowsArgumentException()
    {
        var past = DateTime.Now.AddDays(-1);
        Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureShowtimeIsInTheFuture(past));
    }

    [Fact]
    public void EnsureShowtimeIsInTheFuture_JustPast_ThrowsArgumentException()
    {
        var justPast = DateTime.Now.AddSeconds(-1);
        Assert.Throws<ArgumentException>(() => MovieEventAsserts.EnsureShowtimeIsInTheFuture(justPast));
    }
}
