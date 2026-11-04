namespace Howestprime.Movies.Application.Contracts.Data;

/// <summary>
/// Represents the data of an actor
/// </summary>
public sealed record ActorData
{
    public string Value { get; init; } = string.Empty;
}