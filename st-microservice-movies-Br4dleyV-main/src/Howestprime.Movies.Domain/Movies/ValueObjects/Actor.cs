using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Actor of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The actor of the movie.</param>
public sealed record Actor(
    string Value
) : ValueObject
{
    public static Actor Create(string value)
    {
        Asserts.EnsureNotEmpty(value);
        return new Actor(value);
    }

    public override string ToString()
    {
        return Value;
    }
}