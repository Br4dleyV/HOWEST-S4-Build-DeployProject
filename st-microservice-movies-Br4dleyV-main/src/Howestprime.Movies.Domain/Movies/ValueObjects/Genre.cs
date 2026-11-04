using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Genre of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The genre of the movie.</param>
public sealed record Genre(
    string Value
) : ValueObject
{
    public static Genre Create(string value)
    {
        Asserts.EnsureNotEmpty(value);
        return new Genre(value);
    }

    public override string ToString()
    {
        return Value;
    }
}