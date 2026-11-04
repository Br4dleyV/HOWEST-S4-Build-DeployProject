using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;

public class DefaultAmqpBroker(
    ConnectionFactory factory,
    BrokerConfig brokerConfig,
    ILogger<IAmqpBroker> logger
) : IAmqpBroker
{
    private IChannel? _channel;
    private readonly IList<IAmqpMessageProcessor> _messageProcessors = [];
    private readonly Exchange[] _exchanges = brokerConfig.Exchanges;

    public async Task Connect()
    {
        IConnection conn = await factory.CreateConnectionAsync();
        _channel = await conn.CreateChannelAsync();
        foreach (var exchange in _exchanges)
            await _channel.ExchangeDeclareAsync(
                exchange.Name, 
                exchange.Type, 
                durable: false, 
                autoDelete: true,
                passive: false
            );
        string host = factory.Uri.ToString();
        logger.LogConnectedToAmqpBroker(host);
    }

    public async Task ConsumeFromTopic(ConsumerConfig consumerConfig)
    {
        EnsureValidExchange(consumerConfig.ExchangeName);

        string queueName = 
            consumerConfig.ExchangeName + "." + 
            consumerConfig.QueuePrefix + "." + 
            consumerConfig.OperationId;

         await _channel!.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false
        );

        await _channel!.QueueBindAsync(
            queueName,
            consumerConfig.ExchangeName,
            consumerConfig.Event
        );

        AsyncEventingBasicConsumer consumer = new(_channel);

        consumer.ReceivedAsync += (model, ea) =>
        {
            string message = System.Text.Encoding.UTF8.GetString(ea.Body.ToArray());

            ConsumerContext ctx = CreateConsumerContext(consumerConfig, message);

            if (ea.BasicProperties.IsContentTypePresent())
                ctx.ContentType = ea.BasicProperties.ContentType;

            foreach (var processor in _messageProcessors)
            {
                try
                {
                    processor.ProcessMessage(ctx);
                }
                catch (Exception ex)
                {
                    logger.LogErrorProcessingMessage(ex, ctx.ExchangeName, ctx.EventName, ctx.Message);
                }
            }

            return Task.CompletedTask;
        };

        await _channel.BasicConsumeAsync(queueName, autoAck: true, consumer);
    }

    public Task PublishOnTopic(string exchangeName, string routingKey, string message)
    {
        EnsureValidExchange(exchangeName);

        BasicProperties? props = new()
        {
            ContentType = "application/json"
        };
        
        return _channel!.BasicPublishAsync(
            exchange: exchangeName,
            routingKey: routingKey,
            mandatory: false,
            basicProperties: props,
            body: System.Text.Encoding.UTF8.GetBytes(message)
        ).AsTask();
    }

    public IAmqpBroker AddMessageProcessor(IAmqpMessageProcessor messageProcessor)
    {
        _messageProcessors.Add(messageProcessor);
        return this;
    }

    private void EnsureValidExchange(string exchangeName)
    {
        if (_exchanges.All(exchange => exchange.Name != exchangeName))
            throw new ArgumentException($"Exchange {exchangeName} is not valid.");
    }

    private static ConsumerContext CreateConsumerContext(ConsumerConfig config, string message)
    {
        return new(config.ExchangeName, config.Event, config.OperationId, message, null);
    }
}