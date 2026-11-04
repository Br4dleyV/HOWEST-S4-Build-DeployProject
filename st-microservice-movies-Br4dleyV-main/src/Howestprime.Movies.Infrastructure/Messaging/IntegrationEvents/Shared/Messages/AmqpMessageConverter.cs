using System.Text.Json;
using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

public static class AmqpMessageConverter
{
    private static readonly JsonSerializerOptions _serializeOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new EntityIdJsonConverter(), new SinglePropertyValueObjectsJsonConverter() }
    };
    
    private static readonly JsonSerializerOptions _deserializeOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new EntityIdJsonConverter(), new SinglePropertyValueObjectsJsonConverter() }
    };

    public static Type ParseBody<Type>(ConsumerContext ctx)
    {
        return ctx.ContentType switch
        {
            "application/json" => ParseJson<Type>(ctx.Message),
            _ => ParseString<Type>(ctx.Message)
        };
    }

    public static string Serialize(
        IDomainEvent domainEvent, 
        string? contentType = "application/json",
        JsonSerializerOptions? manualOptions = null
    )
    {
        JsonSerializerOptions options = manualOptions ?? _serializeOptions;

        return contentType switch
        {
            "application/json" => JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), options),
            _ => throw new NotImplementedException()
        };
    }

    private static Type ParseString<Type>(string message)
    {
        try
        {
            Type type = (Type)Convert.ChangeType(message, typeof(Type));

            return type;
        }
        catch (Exception ex)
        {
            throw new InvalidCastException(string.Format("Failed to parse string message {0} to type {1}", message, typeof(Type)), ex);
        }
    }

    public static JsonElement ParseJson(string message)
    {
        try
        {
            JsonElement json = JsonDocument.Parse(message).RootElement;

            if (json.ValueKind == JsonValueKind.Undefined)
                throw new InvalidCastException(string.Format("message body is empty: {0}, type: {1}", message, typeof(JsonElement)));
                
           return json;
        }
        catch (Exception ex)
        {
            throw new InvalidCastException(string.Format("Failed to parse json message {0} to type {1}", message, typeof(JsonElement)), ex);
        }
    }
    
    private static Type ParseJson<Type>(string message)
    {
        try
        {
            Type type = JsonSerializer.Deserialize<Type>(message, _deserializeOptions)!
                ?? throw new InvalidCastException(string.Format("message body is empty: {0}, type: {1}", message, typeof(Type)));

            return type;
        }
        catch (Exception ex)
        {
            throw new InvalidCastException(string.Format("Failed to parse json message {0} to type {1}", message, typeof(Type)), ex);
        }

    }

}
