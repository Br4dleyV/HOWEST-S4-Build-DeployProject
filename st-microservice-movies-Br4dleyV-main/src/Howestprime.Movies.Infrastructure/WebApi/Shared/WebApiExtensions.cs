using Microsoft.Extensions.DependencyInjection;

namespace Howestprime.Movies.Infrastructure.WebApi.Shared;

public static class WebApiExtensions
{
    public static IServiceCollection AddWebApiValidation(this IServiceCollection services)
    {
        return services.AddValidation(); 
    }
}