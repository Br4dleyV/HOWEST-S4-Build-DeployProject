import { assertEquals, assertThrows } from '@std/assert';

import {
    CardNumber,
    CVV,
    ExpiryDate,
    ExternalId,
    FailureReason,
    Payment,
    PaymentAmount,
    PaymentMethod,
    PaymentStatus,
} from '@/Domain/Ticketing/Payments/mod.ts';

function createPayment(): Payment {
    return Payment.create(
        'provider-12345',
        'Credit Card',
        '4111111111111111',
        '12/2028',
        '123',
        '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        1100,
    );
}

Deno.test('[Unit] - Payment value objects - create - valid values - normalize and accept', () => {
    assertEquals(ExternalId.create('  provider-12345  ').value, 'provider-12345');
    assertEquals(PaymentMethod.create(' Credit Card ').value, 'Credit Card');
    assertEquals(CVV.create('1234').value, '1234');
    assertEquals(PaymentAmount.create(1).value, 1);
    assertEquals(FailureReason.create('  declined  ').value, 'declined');
    assertEquals(PaymentStatus.create('pending').value, 'pending');
});

Deno.test('[Unit] - Payment value objects - create - invalid values - throw', () => {
    assertThrows(() => ExternalId.create('   '), Error);
    assertThrows(() => PaymentMethod.create('Cash'), Error);
    assertThrows(() => CVV.create('12'), Error);
    assertThrows(() => PaymentAmount.create(0), Error);
    assertThrows(() => FailureReason.create('   '), Error);
    assertThrows(() => PaymentStatus.create('unknown'), Error);
});

Deno.test('[Unit] - Payment - create - valid input - starts pending', () => {
    const payment = createPayment();

    assertEquals(payment.status.value, 'pending');
    assertEquals(payment.externalId.value, 'provider-12345');
    assertEquals(payment.orderId.value, '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469');
    assertEquals(payment.bookingId.value, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(payment.amount.value, 1100);
});

Deno.test('[Unit] - Payment - create - invalid expiry date - throws', () => {
    assertThrows(
        () => Payment.create(
            'provider-12345',
            'Credit Card',
            '4111111111111111',
            '13/2028',
            '123',
            '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
            '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            1100,
        ),
        Error,
    );
});

Deno.test('[Unit] - Payment - succeed - pending payment - changes status and raises event', () => {
    const payment = createPayment();

    payment.succeed();

    assertEquals(payment.status.value, 'success');
    assertEquals(payment.hasDomainEvents(), true);

    const event = payment.pullDomainEvents()[0];
    assertEquals(event?.FQDN.value, 'howestprime.ticketing.payment.paymentsuccess');
    const paymentSucceeded = event as unknown as { paymentId: string; orderId: string; bookingId: string };
    assertEquals(paymentSucceeded.paymentId, payment.id.value);
    assertEquals(paymentSucceeded.orderId, payment.orderId.value);
    assertEquals(paymentSucceeded.bookingId, payment.bookingId.value);
});

Deno.test('[Unit] - Payment - fail - pending payment - changes status and raises event', () => {
    const payment = createPayment();

    payment.fail('declined by provider');

    assertEquals(payment.status.value, 'failed');
    assertEquals(payment.hasDomainEvents(), true);

    const event = payment.pullDomainEvents()[0];
    assertEquals(event?.FQDN.value, 'howestprime.ticketing.payment.paymentfailed');
    const paymentFailed = event as unknown as { reason: string };
    assertEquals(paymentFailed.reason, 'declined by provider');
});

Deno.test('[Unit] - Payment - succeed/fail - non pending payment - throws', async () => {
    const payment = createPayment();

    payment.succeed();

    assertThrows(() => payment.fail('too late'), Error);
});

Deno.test('[Unit] - Payment - succeed/fail - failed payment - throws on succeed', () => {
    const payment = createPayment();
    payment.fail('declined by provider');
    assertThrows(() => payment.succeed(), Error);
});

Deno.test('[Unit] - Payment value objects - CardNumber - 12 digits valid', () => {
    const cardNumber = CardNumber.create('111111111111');
    assertEquals(cardNumber.value, '111111111111');
});

Deno.test('[Unit] - Payment value objects - CardNumber - invalid format', () => {
    assertThrows(() => CardNumber.create('1111-1111-1111-1111'), Error);
    assertThrows(() => CardNumber.create('abcd'), Error);
    assertThrows(() => CardNumber.create(''), Error);
});

Deno.test('[Unit] - Payment value objects - CardNumber - equals - same value', () => {
    const card1 = CardNumber.create('4111111111111111');
    const card2 = CardNumber.create('4111111111111111');
    assertEquals(card1.equals(card2), true);
});

Deno.test('[Unit] - Payment value objects - CardNumber - equals - different value', () => {
    const card1 = CardNumber.create('4111111111111111');
    const card2 = CardNumber.create('5555555555554444');
    assertEquals(card1.equals(card2), false);
});

Deno.test('[Unit] - Payment value objects - ExpiryDate - invalid format', () => {
    assertThrows(() => ExpiryDate.create('13/2028'), Error); // invalid month
    assertThrows(() => ExpiryDate.create('00/2028'), Error); // invalid month
    assertThrows(() => ExpiryDate.create('12-2028'), Error); // wrong separator
    assertThrows(() => ExpiryDate.create('12 2028'), Error); // wrong separator
});

Deno.test('[Unit] - Payment value objects - ExpiryDate - equals', () => {
    const exp1 = ExpiryDate.create('12/2028');
    const exp2 = ExpiryDate.create('12/2028');
    assertEquals(exp1.equals(exp2), true);
});

Deno.test('[Unit] - Payment value objects - CVV - 3 digits valid', () => {
    const cvv = CVV.create('123');
    assertEquals(cvv.value, '123');
});

Deno.test('[Unit] - Payment value objects - CVV - invalid length', () => {
    assertThrows(() => CVV.create('12'), Error);
    assertThrows(() => CVV.create('12345'), Error);
    assertThrows(() => CVV.create('abc'), Error);
});

Deno.test('[Unit] - Payment value objects - CVV - equals', () => {
    const cvv1 = CVV.create('123');
    const cvv2 = CVV.create('123');
    assertEquals(cvv1.equals(cvv2), true);
});

Deno.test('[Unit] - Payment value objects - ExternalId - equals', () => {
    const id1 = ExternalId.create('provider-123');
    const id2 = ExternalId.create('provider-123');
    assertEquals(id1.equals(id2), true);
});

Deno.test('[Unit] - Payment value objects - PaymentMethod - equals', () => {
    const m1 = PaymentMethod.create('Credit Card');
    const m2 = PaymentMethod.create('Credit Card');
    assertEquals(m1.equals(m2), true);
});

Deno.test('[Unit] - Payment value objects - PaymentAmount - equals', () => {
    const a1 = PaymentAmount.create(1100);
    const a2 = PaymentAmount.create(1100);
    assertEquals(a1.equals(a2), true);
});

Deno.test('[Unit] - Payment value objects - PaymentStatus - equals', () => {
    const s1 = PaymentStatus.create('pending');
    const s2 = PaymentStatus.create('pending');
    assertEquals(s1.equals(s2), true);
});

Deno.test('[Unit] - Payment value objects - PaymentStatus - all statuses', () => {
    assertEquals(PaymentStatus.create('success').value, 'success');
    assertEquals(PaymentStatus.create('failed').value, 'failed');
    assertEquals(PaymentStatus.pending().value, 'pending');
});

Deno.test('[Unit] - Payment value objects - FailureReason - equals', () => {
    const r1 = FailureReason.create('declined by provider');
    const r2 = FailureReason.create('declined by provider');
    assertEquals(r1.equals(r2), true);
});

Deno.test('[Unit] - Payment value objects - FailureReason - short reason', () => {
    const r1 = FailureReason.create('a');
    assertEquals(r1.value, 'a');
});

Deno.test('[Unit] - Payment value objects - FailureReason - empty after trim', () => {
    assertThrows(() => FailureReason.create('   '), Error);
});

Deno.test('[Unit] - Payment - reconstitute - restores persisted snapshot', () => {
    const payment = Payment.reconstitute({
        id: '3c4cbb07-6c9f-4c60-9f79-7cc5eb5cbf7d',
        externalId: 'provider-12345',
        paymentMethod: 'Credit Card',
        cardNumber: '4111111111111111',
        expiryDate: '12/2028',
        cvv: '123',
        orderId: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        amount: 1100,
        status: 'pending',
    });

    assertEquals(payment.id.value, '3c4cbb07-6c9f-4c60-9f79-7cc5eb5cbf7d');
    assertEquals(payment.status.value, 'pending');
});