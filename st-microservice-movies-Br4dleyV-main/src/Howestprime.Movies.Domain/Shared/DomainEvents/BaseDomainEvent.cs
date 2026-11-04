using Howestprime.Movies.Domain.Shared.DomainEvents;

namespace Howestprime.Movies.Domain.Shared;

public class BaseDomainEvent(
    string eventName,
    string aggregateName,
    string boundedContext = nameof(Movies),
    string companyName = nameof(Howestprime)
) : IDomainEvent
{
    public string FQDN { get; private init; } = $"{companyName}.{boundedContext}.{aggregateName}.{eventName}";
    public DateTime OccurredOn { get; private init; } = DateTime.UtcNow;
}
