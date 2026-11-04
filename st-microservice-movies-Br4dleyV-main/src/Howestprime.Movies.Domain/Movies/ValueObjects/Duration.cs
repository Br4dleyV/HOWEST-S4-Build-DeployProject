using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Duration of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The duration of the movie.</param>
public sealed record Duration(
    int Value
) : ValueObject
{
    public static Duration Create(int value)
    {
        Asserts.EnsureGreaterThan(value, 0);
        return new Duration(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}