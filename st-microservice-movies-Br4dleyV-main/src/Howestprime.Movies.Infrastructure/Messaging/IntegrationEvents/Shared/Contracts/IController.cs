namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;

public interface IController<in Context>
{
    Task Handle(Context context);
}
