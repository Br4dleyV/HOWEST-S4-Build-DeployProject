using Microsoft.Extensions.Logging;
using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.DomainEvents;

public sealed class DomainEventPublisher(
    IList<IDomainEventListener> listeners,
    ILogger<DomainEventPublisher> logger
) : IDomainEventPublisher
{
    public async Task Publish(IDomainEvent domainEvent)
    {
        string eventName = domainEvent.GetType().FullName ?? "UnknownDomainEvent";
        logger.LogPublishingDomainEvent(eventName);

        IEnumerable<Task> dispatchedTasks = listeners.Select(listener =>
            listener.Listen(domainEvent));

        await Task.WhenAll(dispatchedTasks);
    }

    public void Register(IDomainEventListener listener)
    {
        string listenerName = listener.GetType().FullName ?? "UnknownDomainEventListener";
        logger.LogRegisteringDomainEventListener(listenerName);
            
        listeners.Add(listener);
    }
}
