using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.Shared.DomainEvents;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.DomainEvents;
public sealed class PolicyDomainEventListenerWithDI(
    IServiceProvider serviceProvider,
    ILogger<PolicyDomainEventListenerWithDI> logger
) : IDomainEventListener
{
    private readonly IReadOnlyDictionary<Type, List<Type>> _policiesByDomainEventType
        = GetPoliciesByDomainEventType();

    public Task Listen(IDomainEvent domainEvent)
    {
        string eventName = domainEvent.GetType().FullName ?? "UnknownDomainEvent";
        logger.LogListeningForDomainEvent(eventName);

        List<Type> policyTypes = [.._policiesByDomainEventType.GetValueOrDefault(
            domainEvent.GetType(),
            []
        )];

        return InvokePolicies(policyTypes, domainEvent);
    }

    private Task InvokePolicies(
        IEnumerable<Type> policyTypes,
        IDomainEvent domainEvent
    )
    {
        foreach (Type policyType in policyTypes)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    object? policy = serviceProvider.CreateScope()
                        .ServiceProvider.GetService(policyType);

                    if (policy == null)
                    {
                        logger.LogNoServiceFoundForPolicy(policyType.FullName);

                        return;
                    }

                    string eventTypeName = domainEvent.GetType().FullName ?? "UnknownDomainEvent";
                    logger.LogInvokingPolicy(policyType.FullName, eventTypeName);

                    await ((dynamic) policy).Execute((dynamic)domainEvent);
                }
                catch (Exception ex)
                {
                    logger.LogErrorInvokingPolicy(ex, policyType.FullName, ex.Message);
                }
            });
        }

        return Task.CompletedTask;
    }

    private static Dictionary<Type, List<Type>> GetPoliciesByDomainEventType()
    {
        return AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(assembly => assembly.GetTypes())
            .Where(type => !type.IsAbstract && !type.IsInterface)
            .SelectMany(type => type.GetInterfaces(), (type, interfaceType) => new { type, interfaceType })
            .Where(t => t.interfaceType.IsGenericType &&
                        t.interfaceType.GetGenericTypeDefinition() == typeof(IPolicy<>))
            .GroupBy(
                t => t.interfaceType.GetGenericArguments()[0],
                t => t.type
            )
            .ToDictionary(
                g => g.Key,
                g => g.ToList()
            );
    }
}
