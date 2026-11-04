namespace Howestprime.Movies.Application.Contracts.Data;

/// <summary>
/// Represents the data of a genre
/// </summary>
public sealed record GenreData
{
    public string Value { get; init; } = string.Empty;
}