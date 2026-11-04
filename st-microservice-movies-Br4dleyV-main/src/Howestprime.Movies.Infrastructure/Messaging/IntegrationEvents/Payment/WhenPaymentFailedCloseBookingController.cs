using System.Text.Json;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Payment;

public class WhenPaymentFailedCloseBookingController : IController<ConsumerContext>
{
    private readonly IUseCase<CloseBookingInput> _closeBooking;
    private readonly ILogger<WhenPaymentFailedCloseBookingController> _logger;

public WhenPaymentFailedCloseBookingController(IUseCase<CloseBookingInput> closeBooking, ILogger<WhenPaymentFailedCloseBookingController> logger)
{
    _closeBooking = closeBooking;
    _logger = logger;
}

public async Task Handle(ConsumerContext ctx)
{
    _logger.LogInvokingController(nameof(WhenPaymentFailedCloseBookingController), ctx.Message);

    using var doc = JsonDocument.Parse(ctx.Message);
    var bookingIdStr = doc.RootElement.GetProperty("bookingId").GetString();

    if (string.IsNullOrWhiteSpace(bookingIdStr) || !Guid.TryParse(bookingIdStr, out var bookingGuid))
        throw new ArgumentException("Invalid bookingId in PaymentFailed event.");

    await _closeBooking.Execute(new CloseBookingInput(bookingGuid, CloseBookingReason.PaymentFailed));
    }
}
