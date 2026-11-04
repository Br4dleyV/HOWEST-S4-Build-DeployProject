using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Age rating of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The age rating of the movie.</param>
public sealed record AgeRating(
    int? Value
) : ValueObject
{
    public static AgeRating Create(int? value)
    {
        return new AgeRating(value);
    }

    public override string ToString()
    {
        return Value?.ToString() ?? string.Empty;
    }
}