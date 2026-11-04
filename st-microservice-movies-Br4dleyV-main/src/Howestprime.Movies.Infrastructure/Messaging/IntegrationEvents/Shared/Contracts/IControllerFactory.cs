namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;

public interface IControllerFactory
{
    IController<ConsumerContext> CreateController(ConsumerContext consumerContext);
}
