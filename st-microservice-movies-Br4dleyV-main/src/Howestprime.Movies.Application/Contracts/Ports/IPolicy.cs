using Howestprime.Movies.Domain.Shared.DomainEvents;

namespace Howestprime.Movies.Application.Contracts.Ports;

public interface IPolicy<in TDomainEvent>
    where TDomainEvent : IDomainEvent
{
    Task Execute (TDomainEvent domainEvent);
}