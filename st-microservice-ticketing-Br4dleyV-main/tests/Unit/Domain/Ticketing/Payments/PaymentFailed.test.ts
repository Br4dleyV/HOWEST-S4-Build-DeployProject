import { assertEquals } from '@std/assert';

import { PaymentFailed } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - PaymentFailed - create - creates event with all properties', () => {
    const event = PaymentFailed.create('payment-123', 'order-456', 'booking-789', 'insufficient funds');

    assertEquals(event.paymentId, 'payment-123');
    assertEquals(event.orderId, 'order-456');
    assertEquals(event.bookingId, 'booking-789');
    assertEquals(event.reason, 'insufficient funds');
});

Deno.test('[Unit] - PaymentFailed - FQDN - returns correct routing key', () => {
    const event = PaymentFailed.create('payment-123', 'order-456', 'booking-789', 'declined');

    assertEquals(event.FQDN.value, 'howestprime.ticketing.payment.paymentfailed');
});

Deno.test('[Unit] - PaymentFailed - occurredOn - returns date type', () => {
    const event = PaymentFailed.create('payment-123', 'order-456', 'booking-789', 'timeout');

    assertEquals(event.occurredOn instanceof Date, true);
});

Deno.test('[Unit] - PaymentFailed - FQDN_VALUE - is class constant', () => {
    assertEquals(PaymentFailed.FQDN_VALUE.value, 'howestprime.ticketing.payment.paymentfailed');
});

Deno.test('[Unit] - PaymentFailed - multiple events - have independent properties', () => {
    const event1 = PaymentFailed.create('payment-123', 'order-456', 'booking-789', 'reason1');
    const event2 = PaymentFailed.create('payment-124', 'order-457', 'booking-790', 'reason2');

    assertEquals(event1.paymentId, 'payment-123');
    assertEquals(event2.paymentId, 'payment-124');
    assertEquals(event1.reason, 'reason1');
    assertEquals(event2.reason, 'reason2');
    assertEquals(event1.FQDN.equals(event2.FQDN), true);
});

Deno.test('[Unit] - PaymentFailed - with long reason - stores full text', () => {
    const longReason = 'This is a very long failure reason with multiple words and explanation';
    const event = PaymentFailed.create('payment-123', 'order-456', 'booking-789', longReason);

    assertEquals(event.reason, longReason);
});
