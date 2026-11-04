namespace Howestprime.Movies.Domain.Shared.DomainEvents;

public interface IDomainEventListener
{
    Task Listen(IDomainEvent domainEvent);
}
