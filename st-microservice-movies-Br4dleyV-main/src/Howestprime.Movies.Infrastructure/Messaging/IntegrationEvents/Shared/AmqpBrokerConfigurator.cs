using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;

public sealed class AmqpBrokerConfigurator
{
    private readonly string _host;
    private readonly IList<ConsumerConfig> _consumerConfigs;
    private readonly IList<PublisherConfig> _publisherConfigs;
    private readonly BrokerConfig _brokerConfig;
    private readonly ILogger<AmqpBrokerConfigurator> _logger;

    private AmqpBrokerConfigurator(
        ILogger<AmqpBrokerConfigurator> logger,
        string host,
        IList<ConsumerConfig> consumerConfigs,
        IList<PublisherConfig> publisherConfigs,
        BrokerConfig brokerConfig
    )
    {
        _host = host;
        _consumerConfigs = consumerConfigs;
        _publisherConfigs = publisherConfigs;
        _brokerConfig = brokerConfig;
        _logger = logger;
    }

    public static AmqpBrokerConfigurator Create(
        ILogger<AmqpBrokerConfigurator> logger,
        string asyncApiSpecification,
        string hostname,
        string port,
        string virtualHost,
        string username,
        string password
    )
    {
        var host = $"amqp://{username}:{password}@{hostname}:{port}/{virtualHost}";
        logger.LogConnectingToAmqpBroker(host);
        var asyncApiYaml = File.ReadAllText(asyncApiSpecification);
        var (brokerConfig, publishers, consumers) = AsyncApiParser.ParseAsyncApi(asyncApiYaml);
        return new AmqpBrokerConfigurator(logger, host, consumers, publishers, brokerConfig);
    }

    public IAmqpBroker CreateMessageBroker(ILogger<IAmqpBroker> logger)
    {
        ConnectionFactory connectionFactory = new()
        {
            Uri = new Uri(_host)
        };

        return new DefaultAmqpBroker(connectionFactory, _brokerConfig, logger);
    }

    public void RegisterAmqpTopicConsumersAsync(IAmqpBroker amqpBroker)
    {
        foreach (var config in _consumerConfigs)
        {
            _logger.LogRegisteredConsumer(
                config.ExchangeName,
                config.Event,
                config.OperationId);

            amqpBroker.ConsumeFromTopic(config);
        }
    }

    public IEnumerable<AmqpTopicPublisher> RegisterAmqpTopicPublishers(IAmqpBroker amqpBroker)
    {
        foreach (var pc in _publisherConfigs)
        {
            string events = string.Join(", ", pc.Events);
            _logger.LogRegisteredPublisher(pc.ExchangeName, events);
        }

        return [.. _publisherConfigs
            .Select(pc => new AmqpTopicPublisher(amqpBroker, pc.ExchangeName, pc.Events))
        ];
    }
}