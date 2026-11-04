using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Release year of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The release year of the movie.</param>
public sealed record ReleaseYear(
    int Value
) : ValueObject
{
    public static ReleaseYear Create(int value)
    {
        EnsureYearIsNotInFuture(value);
        return new ReleaseYear(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }

    private static void EnsureYearIsNotInFuture(int year)
    {
        if (year > DateTime.Now.Year)
            throw new ArgumentException("Release year cannot be in the future.", nameof(year));
    }
}