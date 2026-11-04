using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.ValueObjects;

/// <summary>
/// Poster URL of a movie. Cannot be empty.
/// </summary>
/// <param name="Value">The poster URL of the movie.</param>
public sealed record PosterUrl(
    string? Value
) : ValueObject
{
    public static PosterUrl Create(string? value)
    {
        return new PosterUrl(value);
    }

    public override string ToString()
    {
        return Value ?? string.Empty;
    }
}