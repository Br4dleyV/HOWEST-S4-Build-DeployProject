namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Messages;

using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Shared.Logging;

public class MessageProcessorWithDI(
    IServiceProvider serviceProvider,
    ILogger<MessageProcessorWithDI> logger
) : IAmqpMessageProcessor
{
    public Task ProcessMessage(ConsumerContext ctx)
    {
        logger.LogProcessingMessage(ctx.ExchangeName, ctx.EventName, ctx.Message);

        IServiceProvider scopedProvider = serviceProvider.CreateScope().ServiceProvider;

        return InvokeController(ctx, scopedProvider);
    }

    private async Task InvokeController(
        ConsumerContext ctx,
        IServiceProvider scopedProvider)
    {
        string operationId = ctx.OperationId
            ?? throw new InvalidOperationException("OperationId is null in ConsumerContext");

        IController<ConsumerContext> controller = 
            scopedProvider.GetKeyedService<IController<ConsumerContext>>(operationId)
            ?? throw new InvalidOperationException(
                $"No controller for AsyncAPI operation ID: {operationId}");
        
        try
        {
            await controller.Handle(ctx);
        }
        catch (Exception ex)
        {
            logger.LogErrorRetrievingController(ex, operationId, ex.Message);
        }
    }

}