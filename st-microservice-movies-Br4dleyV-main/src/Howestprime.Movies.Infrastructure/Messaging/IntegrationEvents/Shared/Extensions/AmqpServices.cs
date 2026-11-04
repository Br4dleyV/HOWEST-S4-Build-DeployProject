using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Extensions;

public static class AmqpServices
{
    public static IServiceCollection AddAmqpServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services
            .AddAmqpBrokerConfigurator(configuration)
            .AddAmqpBroker()
            .AddScoped<IController<ConsumerContext>, Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Payment.WhenPaymentFailedCloseBookingController>()
            .AddScoped<IController<ConsumerContext>, Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Payment.WhenPaymentSuccessCloseBookingController>();
    }

    public static async Task RunAmqpServices(
        IServiceProvider serviceProvider
    )
    {
        IAmqpBroker broker = serviceProvider.GetRequiredService<IAmqpBroker>()!;
        AmqpBrokerConfigurator configurator = serviceProvider.GetRequiredService<AmqpBrokerConfigurator>()!;
        IDomainEventPublisher domainEventPublisher = serviceProvider.GetRequiredService<IDomainEventPublisher>()!;
        await broker.Connect();
        configurator.RegisterAmqpTopicConsumersAsync(broker);
        configurator.RegisterAmqpTopicPublishers(broker)
            .ToList()
            .ForEach(domainEventPublisher.Register);
    }


    private static IServiceCollection AddAmqpBrokerConfigurator(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        ILogger<AmqpBrokerConfigurator> logger =
            services.BuildServiceProvider().GetRequiredService<ILogger<AmqpBrokerConfigurator>>()!;

        return services.AddSingleton(serviceProvider =>
        {
            return AmqpBrokerConfigurator.Create(
                logger,
                configuration.GetValue<string>("MessageBroker:AsyncApiPath")!,
                configuration.GetValue<string>("MessageBroker:Hostname")!,
                configuration.GetValue<string>("MessageBroker:Port")!,
                configuration.GetValue<string>("MessageBroker:VirtualHost")!,
                configuration.GetValue<string>("MessageBroker:Username")!,
                configuration.GetValue<string>("MessageBroker:Password")!,
                configuration.GetValue<string>("MessageBroker:ConnectionString")
            );
        });
    }

    private static IServiceCollection AddAmqpBroker(
        this IServiceCollection services
    )
    {
        return services.AddSingleton(serviceProvider =>
        {
            AmqpBrokerConfigurator configurator = serviceProvider.GetRequiredService<AmqpBrokerConfigurator>()!;
            ILogger<DefaultAmqpBroker> logger = serviceProvider.GetRequiredService<ILogger<DefaultAmqpBroker>>()!;
            ILogger<MessageProcessorWithDI> mpLogger = serviceProvider.GetRequiredService<ILogger<MessageProcessorWithDI>>()!;

            return configurator
                .CreateMessageBroker(logger)
                .AddMessageProcessor(new MessageProcessorWithDI(serviceProvider, mpLogger));
        });
    }
}
