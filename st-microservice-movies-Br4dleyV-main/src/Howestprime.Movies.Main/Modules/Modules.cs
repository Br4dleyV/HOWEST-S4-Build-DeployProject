using Howestprime.Movies.Main.Modules.Application;
using Howestprime.Movies.Main.Modules.Messaging.DomainEvents;
using Howestprime.Movies.Main.Modules.Messaging.IntegrationEvents;
using Howestprime.Movies.Main.Modules.Persistence.EntityFramework;
using Howestprime.Movies.Main.Modules.WebApi;

namespace Howestprime.Movies.Main.Modules;

public static class ModuleExtensions
{
    public static IServiceCollection AddModules(
        this IServiceCollection services, 
        IConfiguration configuration
    )
    {
        services.AddApplicationModule(configuration);
        services.AddEFCoreModule(configuration);
        services.AddWebApiModule(configuration);
        services.AddDomainEventModule(configuration);
        services.AddMessagingModule(configuration); 
        return services;
    }

    public static async Task<WebApplication> UseModules(this WebApplication app)
    {
        await app.UseEFCoreModule();
        app.UseWebApiModule();
        return app;
    }
}