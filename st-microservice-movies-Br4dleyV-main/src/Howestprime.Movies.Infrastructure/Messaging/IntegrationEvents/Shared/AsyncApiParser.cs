using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using YamlDotNet.RepresentationModel;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;

public static class AsyncApiParser
{
    public static (
      BrokerConfig brokerConfig,
      List<PublisherConfig> publishers,
      List<ConsumerConfig> consumers
    )

    ParseAsyncApi(string asyncApiYaml)
    {
        var yamlStream = new YamlStream();
        yamlStream.Load(new StringReader(asyncApiYaml));

        var root = (YamlMappingNode)yamlStream.Documents[0].RootNode;

        string host = ParseBrokerHost(root);

        var channelsBindingMap = ParseChannels(root);

        YamlNode metadata = "";
        if (root.Children.TryGetValue("info", out var infoNode) 
            && infoNode is YamlMappingNode infoMap 
            && infoMap.Children.TryGetValue("x-metadata", out var metadataNode))
        {
            metadata = metadataNode;
        }

        var (publishers, consumers) = ParseOperations(root, channelsBindingMap, metadata);

        var distinctExchanges = channelsBindingMap
            .Values
            .Select(x => new Exchange(x.ExchangeName, x.ExchangeType))
            .DistinctBy(x => (x.Name, x.Type))
            .ToArray();

        var brokerConfig = new BrokerConfig(
            Host: host,
            Exchanges: distinctExchanges
        );

        return (brokerConfig, publishers, consumers);
    }

    private static string ParseBrokerHost(YamlMappingNode root)
    {
        if (!root.Children.TryGetValue("servers", out var serversNode))
            throw new InvalidOperationException("No 'servers' section found in AsyncAPI.");

        if (serversNode is not YamlMappingNode serversMap)
            throw new InvalidOperationException("'servers' node must be a mapping node.");

        if (!serversMap.Children.TryGetValue("messagebroker", out var messageBrokerNode))
            throw new InvalidOperationException("No 'messageBroker' server found in 'servers'.");

        if (messageBrokerNode is not YamlMappingNode messageBrokerMap)
            throw new InvalidOperationException("'messagebroker' must be a mapping node.");

        if (!messageBrokerMap.Children.TryGetValue("host", out var hostNode))
            throw new InvalidOperationException("No 'host' property found in 'servers.messagebroker'.");

        return hostNode.ToString();
    }

    private static Dictionary<string, ChannelBindingData> ParseChannels(YamlMappingNode root)
    {
        var channelsBindingMap = new Dictionary<string, ChannelBindingData>();

        if (!root.Children.TryGetValue("channels", out var channelsNode)) return channelsBindingMap;

        var channelsMap = (YamlMappingNode)channelsNode;
        foreach (var channelEntry in channelsMap.Children)
        {
            var channelName = channelEntry.Key.ToString();
            var channelValue = (YamlMappingNode)channelEntry.Value;
            var bindingData = ParseChannelBindingData(channelName, channelValue);

            channelsBindingMap[channelName] = bindingData;
        }

        return channelsBindingMap;
    }

    private static ChannelBindingData ParseChannelBindingData(string channelName, YamlMappingNode channelValue)
    {
        var bindingData = new ChannelBindingData
        {
            ExchangeName = "",
            ExchangeType = "",
            RoutingKey = channelName
        };

        if (channelValue.Children.TryGetValue("bindings", out var bindingsNode))
        {
            var bindingsMap = (YamlMappingNode)bindingsNode;
            if (bindingsMap.Children.TryGetValue("amqp", out var amqpNode))
            {
                var amqpMap = (YamlMappingNode)amqpNode;
                if (amqpMap.Children.TryGetValue("exchange", out var exchangeNode))
                {
                    var exchangeMap = (YamlMappingNode)exchangeNode;
                    ParseExchange(exchangeMap, bindingData);
                }
            }
        }

        return bindingData;
    }

    private static void ParseExchange(YamlMappingNode exchangeMap, ChannelBindingData bindingData)
    {
        if (exchangeMap.Children.TryGetValue("name", out var exchangeNameNode))
            bindingData.ExchangeName = exchangeNameNode.ToString();

        if (exchangeMap.Children.TryGetValue("type", out var exchangeTypeNode))
            bindingData.ExchangeType = exchangeTypeNode.ToString();

        if (exchangeMap.Children.TryGetValue("routingKey", out var routingKeyNode))
            bindingData.RoutingKey = routingKeyNode.ToString();
    }

    private static (List<PublisherConfig>, List<ConsumerConfig>) ParseOperations(
        YamlMappingNode root,
        Dictionary<string, ChannelBindingData> channelsBindingMap,
        YamlNode metadata)
    {
        var publishers = new List<PublisherConfig>();
        var consumers = new List<ConsumerConfig>();

        if (!root.Children.TryGetValue("operations", out var operationsNode)) return (publishers, consumers);

        var operationsMap = (YamlMappingNode)operationsNode;
        foreach (var operationEntry in operationsMap.Children)
        {
            var operationId = operationEntry.Key.ToString();
            var operationValue = (YamlMappingNode)operationEntry.Value;

            ProcessOperation(
                channelsBindingMap, 
                operationId, 
                operationValue, 
                publishers, 
                consumers, 
                metadata
            );
        }

        return (publishers, consumers);
    }

    private static void ProcessOperation(
        Dictionary<string, ChannelBindingData> channelsBindingMap,
        string operationId,
        YamlMappingNode operationValue,
        List<PublisherConfig> publishers,
        List<ConsumerConfig> consumers,
        YamlNode metadata)
    {
        if (!operationValue.Children.TryGetValue("action", out var actionNode)) return;

        var action = actionNode.ToString();

        if (!operationValue.Children.TryGetValue("channel", out var channelNode)) return;

        if (channelNode is not YamlMappingNode channelMap) return;

        if (!channelMap.Children.TryGetValue("$ref", out var channelRefNode)) return;

        var channelRef = channelRefNode.ToString();
        var channelName = channelRef
            .Replace("#/channels/", "")
            .Trim();

        if (!channelsBindingMap.TryGetValue(channelName, out var bindingData)) return;

        if (action.Equals("receive", StringComparison.OrdinalIgnoreCase))
        {
            var boundedContext = "";
            if (metadata is YamlMappingNode metadataMap 
                && metadataMap.Children.TryGetValue("BoundedContext", out var boundedContextNode))
                boundedContext = boundedContextNode.ToString();

            var consumer = new ConsumerConfig(
                OperationId: operationId,
                ExchangeName: bindingData.ExchangeName,
                Event: bindingData.RoutingKey,
                QueuePrefix: boundedContext
            );
            
            consumers.Add(consumer);
        }
        else if (action.Equals("send", StringComparison.OrdinalIgnoreCase))
        {
            var existingPublisher = publishers.FirstOrDefault(p => p.ExchangeName == bindingData.ExchangeName);
            if (existingPublisher != null)
                existingPublisher.Events.Add(bindingData.RoutingKey);
            else
            {
                var publisher = new PublisherConfig(
                    Publisher: operationId,
                    ExchangeName: bindingData.ExchangeName,
                    Events: [bindingData.RoutingKey]
                );
                publishers.Add(publisher);
            }
        }
    }

    private sealed record ChannelBindingData
    {
        public string ExchangeName { get; set; } = "";
        public string ExchangeType { get; set; } = "";
        public string RoutingKey { get; set; } = "";
    }
}