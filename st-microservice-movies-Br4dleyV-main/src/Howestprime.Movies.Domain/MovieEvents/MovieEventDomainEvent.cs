using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Domain.MovieEvents;

/// <summary>
/// Base class for all movie event domain events.
/// FQDN format: howestprime.movies.MovieEvent.{EventName}
/// </summary>
public class MovieEventDomainEvent(string eventName)
    : BaseDomainEvent(
        eventName: eventName,
        aggregateName: "MovieEvent",
        boundedContext: "movies",
        companyName: "howestprime"
    )
{ }
