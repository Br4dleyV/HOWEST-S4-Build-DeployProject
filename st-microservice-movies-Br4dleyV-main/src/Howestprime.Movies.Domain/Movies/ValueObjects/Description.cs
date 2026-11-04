using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Description of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The description of the movie.</param>
public sealed record Description(
    string Value
) : ValueObject
{
    public static Description Create(string value)
    {
        Asserts.EnsureNotEmpty(value);
        return new Description(value);
    }

    public override string ToString()
    {
        return Value;
    }
}