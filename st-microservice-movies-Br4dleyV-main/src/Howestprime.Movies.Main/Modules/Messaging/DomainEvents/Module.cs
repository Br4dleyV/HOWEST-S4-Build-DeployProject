using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Infrastructure.Messaging.DomainEvents;

namespace Howestprime.Movies.Main.Modules.Messaging.DomainEvents;

public static class DomainEventModule
{
    public static IServiceCollection AddDomainEventModule(
        this IServiceCollection services,
        IConfiguration _configuration
    )
    {
        return services
            .RegisterDomainEventListeners()
            .RegisterDomainEventPublisher();
    }
    
    private static IServiceCollection RegisterDomainEventPublisher(this IServiceCollection services)
    {
        return services.AddSingleton<IDomainEventPublisher>(sp =>
        {
            ILogger<DomainEventPublisher> eventPublisherLogger = 
                sp.GetRequiredService<ILogger<DomainEventPublisher>>();

            IList<IDomainEventListener> listeners = [
                sp.GetRequiredService<PolicyDomainEventListenerWithDI>()
            ];

            return new DomainEventPublisher(listeners, eventPublisherLogger);
        });
    }

    private static IServiceCollection RegisterDomainEventListeners(this IServiceCollection services)
    {
        return services.AddSingleton<PolicyDomainEventListenerWithDI>();
    }

    // TODO Create extension method to discover and register all policies automatically.

}