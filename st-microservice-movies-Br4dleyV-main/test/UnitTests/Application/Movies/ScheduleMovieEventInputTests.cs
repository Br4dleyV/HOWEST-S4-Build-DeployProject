using Howestprime.Movies.Application.Movies;

namespace UnitTests.Application.Movies;

/// <summary>
/// Covers compiler-generated members of ScheduleMovieEventInput.
/// </summary>
public sealed class ScheduleMovieEventInputTests
{
    [Fact]
    public void Properties_AreAccessible()
    {
        var movieId = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var showtime = new DateTime(2099, 1, 1, 15, 0, 0);
        var input = new ScheduleMovieEventInput(movieId, roomId, showtime);

        Assert.Equal(movieId, input.MovieId);
        Assert.Equal(roomId, input.RoomId);
        Assert.Equal(showtime, input.Showtime);
    }

    [Fact]
    public void ToString_ContainsValues()
    {
        var movieId = Guid.NewGuid();
        var input = new ScheduleMovieEventInput(movieId, Guid.NewGuid(), new DateTime(2099, 1, 1, 15, 0, 0));
        var result = input.ToString();
        Assert.NotNull(result);
        Assert.Contains(movieId.ToString(), result);
    }

    [Fact]
    public void Equals_SameValues_ReturnsTrue()
    {
        var movieId = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var showtime = new DateTime(2099, 1, 1, 15, 0, 0);
        var first = new ScheduleMovieEventInput(movieId, roomId, showtime);
        var second = new ScheduleMovieEventInput(movieId, roomId, showtime);

        Assert.Equal(first, second);
        Assert.True(first == second);
        Assert.False(first != second);
    }

    [Fact]
    public void Equals_DifferentValues_ReturnsFalse()
    {
        var first = new ScheduleMovieEventInput(Guid.NewGuid(), Guid.NewGuid(), new DateTime(2099, 1, 1, 15, 0, 0));
        var second = new ScheduleMovieEventInput(Guid.NewGuid(), Guid.NewGuid(), new DateTime(2099, 1, 1, 15, 0, 0));
        Assert.NotEqual(first, second);
        Assert.True(first != second);
    }

    [Fact]
    public void Equals_Null_ReturnsFalse()
    {
        var input = new ScheduleMovieEventInput(Guid.NewGuid(), Guid.NewGuid(), new DateTime(2099, 1, 1, 15, 0, 0));
        Assert.False(input.Equals(null));
    }

    [Fact]
    public void Equals_Object_SameValues_ReturnsTrue()
    {
        var movieId = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var showtime = new DateTime(2099, 1, 1, 15, 0, 0);
        var first = new ScheduleMovieEventInput(movieId, roomId, showtime);
        object second = new ScheduleMovieEventInput(movieId, roomId, showtime);
        Assert.True(first.Equals(second));
    }

    [Fact]
    public void GetHashCode_SameValues_SameHash()
    {
        var movieId = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var showtime = new DateTime(2099, 1, 1, 15, 0, 0);
        var first = new ScheduleMovieEventInput(movieId, roomId, showtime);
        var second = new ScheduleMovieEventInput(movieId, roomId, showtime);
        Assert.Equal(first.GetHashCode(), second.GetHashCode());
    }

    [Fact]
    public void With_CreatesModifiedCopy()
    {
        var original = new ScheduleMovieEventInput(Guid.NewGuid(), Guid.NewGuid(), new DateTime(2099, 1, 1, 15, 0, 0));
        var newMovieId = Guid.NewGuid();
        var modified = original with { MovieId = newMovieId };
        Assert.Equal(newMovieId, modified.MovieId);
        Assert.Equal(original.RoomId, modified.RoomId);
    }

    [Fact]
    public void Deconstruct_ReturnsCorrectValues()
    {
        var movieId = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var showtime = new DateTime(2099, 1, 1, 15, 0, 0);
        var input = new ScheduleMovieEventInput(movieId, roomId, showtime);
        input.Deconstruct(out Guid outMovie, out Guid outRoom, out DateTime outShowtime);
        Assert.Equal(movieId, outMovie);
        Assert.Equal(roomId, outRoom);
        Assert.Equal(showtime, outShowtime);
    }
}
