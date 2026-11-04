using System.Text.Json;
using Howestprime.Movies.Application.Movies;
using Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Shared.Contracts;
using Howestprime.Movies.Application.Contracts.Ports;
using Howestprime.Movies.Domain.MovieEvents;
using Microsoft.Extensions.Logging;
using Howestprime.Movies.Shared.Logging;

namespace Howestprime.Movies.Infrastructure.Messaging.IntegrationEvents.Payment;

public class WhenPaymentSuccessCloseBookingController : IController<ConsumerContext>
{
    private readonly IUseCase<CloseBookingInput> _closeBooking;
    private readonly ILogger<WhenPaymentSuccessCloseBookingController> _logger;

public WhenPaymentSuccessCloseBookingController(IUseCase<CloseBookingInput> closeBooking, ILogger<WhenPaymentSuccessCloseBookingController> logger)
{
    _closeBooking = closeBooking;
    _logger = logger;
}

public async Task Handle(ConsumerContext ctx)
{
    _logger.LogInvokingController(nameof(WhenPaymentSuccessCloseBookingController), ctx.Message);

    using var doc = JsonDocument.Parse(ctx.Message);
    var bookingIdStr = doc.RootElement.GetProperty("bookingId").GetString();

    if (string.IsNullOrWhiteSpace(bookingIdStr) || !Guid.TryParse(bookingIdStr, out var bookingGuid))
        throw new ArgumentException("Invalid bookingId in PaymentSuccess event.");

    await _closeBooking.Execute(new CloseBookingInput(bookingGuid, CloseBookingReason.PaymentSuccess));
    }
}
