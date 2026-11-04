using System.Globalization;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Howestprime.Movies.Domain.Shared;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

public class SinglePropertyValueObjectsJsonConverter : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        if (!typeToConvert.IsClass || typeToConvert.IsAbstract)
            return false;

        if (!typeof(ValueObject).IsAssignableFrom(typeToConvert))
            return false;

        PropertyInfo[] properties = [
            .. typeToConvert
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property => property.CanRead)
        ];

        if (properties.Length != 1)
            return false;

        return HasCreateStringMethod(typeToConvert) || HasFromStringMethod(typeToConvert) || HasStringConstructor(typeToConvert);
    }

    private static bool HasCreateStringMethod(Type type)
    {
        return type.GetMethod(
            "Create",
            BindingFlags.Public | BindingFlags.Static,
            binder: null,
            types: [typeof(string)],
            modifiers: null
        ) is not null;
    }

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(SinglePropertyValueObjectConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter?)Activator.CreateInstance(converterType);
    }

    private static bool HasFromStringMethod(Type type)
    {
        return type.GetMethod(
            "From",
            BindingFlags.Public | BindingFlags.Static,
            binder: null,
            types: [typeof(string)],
            modifiers: null
        ) is not null;
    }

    private static bool HasStringConstructor(Type type)
    {
        return type.GetConstructor([typeof(string)]) is not null;
    }

    private sealed class SinglePropertyValueObjectConverter<TValueObject> : JsonConverter<TValueObject>
        where TValueObject : ValueObject
    {
        private static readonly PropertyInfo ValueProperty = GetValueProperty();
        private static readonly Func<string, TValueObject> FromString = CreateFromString();

        public override TValueObject? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return default;

            var text = reader.GetString() ?? string.Empty;
            return FromString(text);
        }

        public override void Write(Utf8JsonWriter writer, TValueObject value, JsonSerializerOptions options)
        {
            if (value is null)
            {
                writer.WriteNullValue();
                return;
            }

            object? propertyValue = ValueProperty.GetValue(value);
            string text = Convert.ToString(propertyValue, CultureInfo.InvariantCulture) ?? string.Empty;
            writer.WriteStringValue(text);
        }

        private static PropertyInfo GetValueProperty()
        {
            PropertyInfo[] properties = typeof(TValueObject)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(property => property.CanRead)
                .ToArray();

            if (properties.Length != 1)
                throw new InvalidOperationException($"{typeof(TValueObject).Name} must have exactly one readable property.");

            return properties[0];
        }

        private static Func<string, TValueObject> CreateFromString()
        {
            MethodInfo? createMethod = typeof(TValueObject).GetMethod(
                "Create",
                BindingFlags.Public | BindingFlags.Static,
                binder: null,
                types: new[] { typeof(string) },
                modifiers: null
            );

            if (createMethod is not null)
                return value => (TValueObject)createMethod.Invoke(null, new object?[] { value })!;

            MethodInfo? fromMethod = typeof(TValueObject).GetMethod(
                "From",
                BindingFlags.Public | BindingFlags.Static,
                binder: null,
                types: [typeof(string)],
                modifiers: null
            );

            if (fromMethod is not null)
                return value => (TValueObject)fromMethod.Invoke(null, [value])!;

            ConstructorInfo? ctor = typeof(TValueObject).GetConstructor([typeof(string)]);
            if (ctor is not null)
                return value => (TValueObject)ctor.Invoke([value]);

            throw new InvalidOperationException(
                $"{typeof(TValueObject).Name} must expose a public static Create(string) or From(string) method, or a public string constructor."
            );
        }
    }
}
