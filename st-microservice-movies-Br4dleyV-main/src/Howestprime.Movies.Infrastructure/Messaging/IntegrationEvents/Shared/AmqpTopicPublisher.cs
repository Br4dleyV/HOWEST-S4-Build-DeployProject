using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;

public sealed class AmqpTopicPublisher(
    IAmqpBroker amqpBroker,
    string exchangeName,
    IList<string> allowedTopics,
    string? contentType = "application/json"
) : IDomainEventListener
{

    public bool IsSubscribedTo(IDomainEvent domainEvent)
    {
        return allowedTopics.Contains(RoutingKey(domainEvent));
    }

    public Task Listen(IDomainEvent domainEvent)
    {
        string routingKey = RoutingKey(domainEvent);

        if (IsSubscribedTo(domainEvent))
            amqpBroker.PublishOnTopic(
                exchangeName,
                routingKey,
                 AmqpMessageConverter.Serialize(domainEvent, contentType)
            );
        
        return Task.CompletedTask;
    }

    private static string RoutingKey(IDomainEvent domainEvent)
    {
        return $"{domainEvent.FQDN.ToLower()}";
    }
}
