namespace Howestprime.Movies.ApiClient.Models;

public static class ApiErrorExtensions
{
    public static string GetFormattedErrors(this IReadOnlyDictionary<string, IReadOnlyList<string>> errors)
    {
        if (errors.Count == 0)
        {
            return string.Empty;
        }

        return string.Join(", ",
            errors.SelectMany(pair => pair.Value.Select(message => $"{pair.Key}: {message}")));
    }
}
