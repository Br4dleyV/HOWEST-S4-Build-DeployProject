using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.Movies.Events;

/// <summary>
/// Base class for all movie-related domain events, providing common properties and functionality.
/// </summary>
/// <param name="eventName">The name of the event.</param>
public class MovieDomainEvent(
    string eventName
) : BaseDomainEvent(
    eventName: eventName,
    aggregateName: nameof(Movie)
)
{ }