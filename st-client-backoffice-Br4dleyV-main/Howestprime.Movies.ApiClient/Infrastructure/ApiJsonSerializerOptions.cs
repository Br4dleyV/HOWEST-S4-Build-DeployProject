using System.Text.Json;

namespace Howestprime.Movies.ApiClient.Infrastructure;

internal static class ApiJsonSerializerOptions
{
    public static JsonSerializerOptions CreateDefault() =>
        new(JsonSerializerDefaults.Web)
        {
            PropertyNameCaseInsensitive = true
        };
}
