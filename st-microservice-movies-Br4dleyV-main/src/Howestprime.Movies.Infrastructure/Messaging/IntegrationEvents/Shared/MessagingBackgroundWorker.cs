using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Extensions;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared;

public class MessagingBackgroundWorker(
    IServiceProvider serviceProvider, 
    ILogger<MessagingBackgroundWorker> logger) 
: BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogMessagingModuleStarting();

        try
        {
            await AmqpServices.RunAmqpServices(serviceProvider);
        }
        catch (Exception ex)
        {
            logger.LogFailedToStartMessagingModule(ex, ex.Message);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try 
            {
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown requested
                break;
            }
            catch (Exception ex)
            {
                logger.LogUnexpectedErrorInMessagingLoop(ex);
            }
        }

        logger.LogMessagingModuleStopping();
    }
}