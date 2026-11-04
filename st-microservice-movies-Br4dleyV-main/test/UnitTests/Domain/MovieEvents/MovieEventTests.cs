using Howestprime.Movies.Domain.MovieEvents;
using Howestprime.Movies.Domain.Movies;
using Howestprime.Movies.Domain.Rooms;
using Howestprime.Movies.Domain.Shared;

namespace UnitTests.Domain.MovieEvents;

public sealed class MovieEventTests
{
    private static readonly MovieId SomeMovieId = new(Guid.NewGuid());
    private static readonly RoomId SomeRoomId = new(Guid.NewGuid());
    private static DateTime FutureShowtime(int hour) =>
        new DateTime(2099, 6, 15, hour, 0, 0);

    [Fact]
    public void Schedule_ValidAt15h_ReturnsMovieEvent()
    {
        var ev = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId, FutureShowtime(15));

        Assert.Equal(SomeMovieId, ev.MovieId);
        Assert.Equal(SomeRoomId, ev.RoomId);
        Assert.Equal(15, ev.Showtime.Hour);
    }

    [Fact]
    public void Schedule_ValidAt19h_ReturnsMovieEvent()
    {
        var ev = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId, FutureShowtime(19));

        Assert.Equal(19, ev.Showtime.Hour);
    }

    [Fact]
    public void Schedule_NewEventId_IsNotEmpty()
    {
        var id = EntityId.New<MovieEventId>();
        var ev = MovieEvent.Schedule(id, SomeMovieId, SomeRoomId, FutureShowtime(15));
        Assert.NotEqual(Guid.Empty, ev.Id.Value);
    }

    [Theory]
    [InlineData(14)]
    [InlineData(16)]
    [InlineData(20)]
    public void Schedule_InvalidHour_ThrowsArgumentException(int hour)
    {
        var showtime = new DateTime(2099, 6, 15, hour, 0, 0);
        Assert.Throws<ArgumentException>(() =>
            MovieEvent.Schedule(EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId, showtime));
    }

    [Fact]
    public void Schedule_PastShowtime_ThrowsArgumentException()
    {
        var past = DateTime.Now.AddDays(-1);
        var pastAt15 = new DateTime(past.Year, past.Month, past.Day, 15, 0, 0);
        Assert.Throws<ArgumentException>(() =>
            MovieEvent.Schedule(EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId, pastAt15));
    }

    [Fact]
    public void AssignMovie_ChangesMovieId()
    {
        var ev = MovieEvent.Schedule(
            EntityId.New<MovieEventId>(), SomeMovieId, SomeRoomId, FutureShowtime(15));

        var newMovieId = new MovieId(Guid.NewGuid());
        ev.AssignMovie(newMovieId);

        Assert.Equal(newMovieId, ev.MovieId);
    }
}
