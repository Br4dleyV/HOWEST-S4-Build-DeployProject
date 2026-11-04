namespace Howestprime.Movies.Domain.MovieEvents;

public static class MovieEventAsserts
{
    /// <summary>
    /// Checks that the showtime is at 15h or 19h, otherwise throws ArgumentException.
    /// </summary>
    public static void EnsureShowtimeIsAt15hOr19h(DateTime time)
    {
        if (time.Hour != 15 && time.Hour != 19)
            throw new ArgumentException("Showtime must be at 15h or 19h.", nameof(time));
    }

    /// <summary>
    /// Checks that the showtime is in the future, otherwise throws ArgumentException.
    /// </summary>
    public static void EnsureShowtimeIsInTheFuture(DateTime time)
    {
        if (time <= DateTime.Now)
            throw new ArgumentException("Showtime must be in the future.", nameof(time));
    }

    /// <summary>
    /// Checks that the showtime is within the next 14 days, otherwise throws ArgumentException.
    /// </summary>
    public static void EnsureShowtimeIsWithin14Days(DateTime time)
    {
        if (time > DateTime.Now.AddDays(14))
            throw new ArgumentException("Showtime must be within the next 14 days.", nameof(time));
    }

    /// <summary>
    /// Checks that the total visitor count is greater than zero, otherwise throws ArgumentException.
    /// </summary>
    public static void EnsureVisitorCountIsGreaterThanZero(int totalVisitors)
    {
        if (totalVisitors <= 0)
            throw new ArgumentException("Total visitor count must be greater than zero.", nameof(totalVisitors));
    }

    /// <summary>
    /// Checks that adding new visitors does not exceed room capacity, otherwise throws ArgumentException.
    /// </summary>
    public static void EnsureCapacityNotExceeded(int currentVisitors, int newVisitors, int roomCapacity)
    {
        if (currentVisitors + newVisitors > roomCapacity)
            throw new ArgumentException(
                $"Total visitors ({currentVisitors + newVisitors}) would exceed room capacity ({roomCapacity}).");
    }
}
