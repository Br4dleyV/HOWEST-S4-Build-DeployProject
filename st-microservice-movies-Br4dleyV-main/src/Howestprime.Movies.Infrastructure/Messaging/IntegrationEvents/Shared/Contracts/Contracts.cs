namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;

public sealed class ConsumerContext
(
    string exchangeName,
    string eventName,
    string operationId,
    string message,
    object? state = null
)
{
    public readonly string ExchangeName = exchangeName;
    public readonly string EventName = eventName;
    public readonly string OperationId = operationId;
    public readonly string Message = message;
    public object? State { get; set; } = state;
    public string? ContentType { get; set; }
}

public sealed record Exchange
(
    string Name,
    string Type
);

public sealed record ConsumerConfig
(
    string OperationId,
    string ExchangeName,
    string Event,
    string QueuePrefix
);

public sealed record PublisherConfig
(
    string Publisher,
    string ExchangeName,
    IList<string> Events
);

public sealed record BrokerConfig
(
    string Host,
    Exchange[] Exchanges
);

public interface IAmqpBroker
{
    Task Connect();

    Task PublishOnTopic(
        string exchangeName,
        string routingKey,
        string message
    );

    Task ConsumeFromTopic
    (
        ConsumerConfig consumerConfig
    );

    IAmqpBroker AddMessageProcessor(
        IAmqpMessageProcessor messageProcessor
    );
}

public interface IAmqpMessageProcessor
{
    Task ProcessMessage(ConsumerContext ctx);
}

public interface IMessageParser
{
    Type Parse<Type>(string message);
}
