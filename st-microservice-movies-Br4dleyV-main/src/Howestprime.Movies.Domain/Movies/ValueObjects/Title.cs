using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Title of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The title of the movie.</param>
public sealed record Title(
    string Value
) : ValueObject
{
    public static Title Create(string value)
    {
        Asserts.EnsureNotEmpty(value);
        return new Title(value);
    }

    public override string ToString()
    {
        return Value;
    }
}