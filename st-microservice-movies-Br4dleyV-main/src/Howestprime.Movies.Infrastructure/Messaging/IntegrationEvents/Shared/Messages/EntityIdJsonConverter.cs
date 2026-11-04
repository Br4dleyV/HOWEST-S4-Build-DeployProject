using System.Text.Json;
using System.Text.Json.Serialization;
using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

public class EntityIdJsonConverter : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        return typeToConvert.IsValueType && typeof(IEntityId).IsAssignableFrom(typeToConvert);
    }

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(EntityIdConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter?)Activator.CreateInstance(converterType);
    }

    private sealed class EntityIdConverter<TEntityId> : JsonConverter<TEntityId> where TEntityId : struct, IEntityId
    {
        public override TEntityId Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var guid = reader.GetGuid();
            return EntityId.New<TEntityId>(guid);
        }

        public override void Write(Utf8JsonWriter writer, TEntityId value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.Value);
        }
    }
}
