using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Extensions;

namespace Howestprime.Movies.Main.Modules.Messaging.IntegrationEvents;

public static class MessagingModule
{
    public static IServiceCollection AddMessagingModule(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return
            services
                .AddAmqpServices(configuration)

                .AddHostedService<MessagingBackgroundWorker>();
    }
}
