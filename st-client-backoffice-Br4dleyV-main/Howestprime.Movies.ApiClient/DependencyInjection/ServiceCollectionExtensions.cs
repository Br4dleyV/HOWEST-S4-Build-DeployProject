using System.Globalization;
using Howestprime.Movies.ApiClient.Clients;
using Howestprime.Movies.ApiClient.Configuration;
using Howestprime.Movies.ApiClient.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Howestprime.Movies.ApiClient.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHowestprimeMoviesApiClient(
        this IServiceCollection services,
        Action<MoviesApiClientOptions> configure)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configure);

        var options = new MoviesApiClientOptions();
        configure(options);
        ValidateOptions(options);

        services.AddSingleton(options);
        services.AddSingleton(ApiJsonSerializerOptions.CreateDefault());

        services.AddHttpClient<IMovieCatalogApiClient, MovieCatalogApiClient>(
            (_, client) => ConfigureHttpClient(client, options));
        services.AddHttpClient<IMovieEventsApiClient, MovieEventsApiClient>(
            (_, client) => ConfigureHttpClient(client, options));

        return services;
    }

    public static IServiceCollection AddHowestprimeMoviesApiClient(
        this IServiceCollection services,
        IConfigurationSection section)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(section);

        return services.AddHowestprimeMoviesApiClient(options =>
        {
            var baseUrl = section["BaseUrl"];
            if (!string.IsNullOrWhiteSpace(baseUrl))
            {
                options.BaseUrl = new Uri(baseUrl, UriKind.Absolute);
            }

            var timeoutSeconds = section["TimeoutSeconds"];
            if (!string.IsNullOrWhiteSpace(timeoutSeconds) &&
                int.TryParse(timeoutSeconds, NumberStyles.Integer, CultureInfo.InvariantCulture, out var seconds))
            {
                options.Timeout = TimeSpan.FromSeconds(seconds);
            }
        });
    }

    private static void ConfigureHttpClient(HttpClient httpClient, MoviesApiClientOptions options)
    {
        httpClient.BaseAddress = options.BaseUrl;
        httpClient.Timeout = options.Timeout;
    }

    private static void ValidateOptions(MoviesApiClientOptions options)
    {
        if (options.BaseUrl is null)
        {
            throw new InvalidOperationException("Movies API base URL is required.");
        }

        if (!options.BaseUrl.IsAbsoluteUri)
        {
            throw new InvalidOperationException("Movies API base URL must be an absolute URI.");
        }

        if (options.Timeout <= TimeSpan.Zero)
        {
            throw new InvalidOperationException("Movies API timeout must be greater than zero.");
        }
    }
}
