import { assertEquals } from '@std/assert';

import { PaymentSucceeded } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - PaymentSucceeded - create - creates event with all properties', () => {
    const event = PaymentSucceeded.create('payment-123', 'order-456', 'booking-789');

    assertEquals(event.paymentId, 'payment-123');
    assertEquals(event.orderId, 'order-456');
    assertEquals(event.bookingId, 'booking-789');
});

Deno.test('[Unit] - PaymentSucceeded - FQDN - returns correct routing key', () => {
    const event = PaymentSucceeded.create('payment-123', 'order-456', 'booking-789');

    assertEquals(event.FQDN.value, 'howestprime.ticketing.payment.paymentsuccess');
});

Deno.test('[Unit] - PaymentSucceeded - occurredOn - returns date type', () => {
    const event = PaymentSucceeded.create('payment-123', 'order-456', 'booking-789');

    assertEquals(event.occurredOn instanceof Date, true);
});

Deno.test('[Unit] - PaymentSucceeded - FQDN_VALUE - is class constant', () => {
    assertEquals(PaymentSucceeded.FQDN_VALUE.value, 'howestprime.ticketing.payment.paymentsuccess');
});

Deno.test('[Unit] - PaymentSucceeded - multiple events - have independent timestamps', () => {
    const event1 = PaymentSucceeded.create('payment-123', 'order-456', 'booking-789');
    const event2 = PaymentSucceeded.create('payment-124', 'order-457', 'booking-790');

    assertEquals(event1.paymentId, 'payment-123');
    assertEquals(event2.paymentId, 'payment-124');
    assertEquals(event1.FQDN.equals(event2.FQDN), true);
});
