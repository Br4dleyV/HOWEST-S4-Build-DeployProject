import { assertEquals } from '@std/assert';
import { Optional } from '@domaincrafters/std';

import { Payment, PaymentId } from '@/Domain/Ticketing/Payments/mod.ts';
import {
    MongoDbPaymentRepository,
    PaymentDocumentMapper,
} from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import type { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

function createStubMongoDbClient() {
    const documents = new Map<string, unknown>();

    return {
        upsertDocument: async (filter: { _id: string }, document: unknown): Promise<{ acknowledged: boolean; matchedCount: number; upsertedCount: number }> => {
            documents.set(filter._id, document);
            return { acknowledged: true, matchedCount: 0, upsertedCount: 1 };
        },
        findDocument: async (filter: { _id: string }): Promise<Optional<unknown>> => {
            const document = documents.get(filter._id);
            return document ? Optional.of(document) : Optional.empty<unknown>();
        },
        deleteDocument: async (filter: { _id: string }): Promise<{ acknowledged: boolean; deletedCount: number }> => {
            const deleted = documents.delete(filter._id);
            return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
        },
    } as unknown as MongoDbClient;
}

Deno.test('[Unit] - MongoDbPaymentRepository - save/byId/remove - persists payments', async () => {
    const repository = new MongoDbPaymentRepository(createStubMongoDbClient(), new PaymentDocumentMapper());
    const payment = Payment.create(
        'provider-12345',
        'Credit Card',
        '4111111111111111',
        '12/2028',
        '123',
        '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        1100,
    );

    assertEquals(MongoDbPaymentRepository.collectionName, 'payments');
    assertEquals(repository.entityName, Payment.name);

    await repository.save(payment);

    const stored = await repository.byId(PaymentId.create(payment.id.value));
    assertEquals(stored.isPresent, true);
    assertEquals(stored.getOrThrow().id.value, payment.id.value);

    await repository.remove(payment);
    const afterRemove = await repository.byId(PaymentId.create(payment.id.value));
    assertEquals(afterRemove.isPresent, false);
});

Deno.test('[Unit] - PaymentDocumentMapper - roundtrip - reconstructs payment snapshot', () => {
    const payment = Payment.create(
        'provider-12345',
        'Credit Card',
        '4111111111111111',
        '12/2028',
        '123',
        '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        1100,
    );

    payment.succeed();

    const mapper = new PaymentDocumentMapper();
    const doc = mapper.toDocument(payment);
    const reconstructed = mapper.reconstitute(doc);

    assertEquals(reconstructed.id.value, payment.id.value);
    assertEquals(reconstructed.externalId.value, payment.externalId.value);
    assertEquals(reconstructed.paymentMethod.value, payment.paymentMethod.value);
    assertEquals(reconstructed.cardNumber.value, payment.cardNumber.value);
    assertEquals(reconstructed.expiryDate.value, payment.expiryDate.value);
    assertEquals(reconstructed.cvv.value, payment.cvv.value);
    assertEquals(reconstructed.orderId.value, payment.orderId.value);
    assertEquals(reconstructed.bookingId.value, payment.bookingId.value);
    assertEquals(reconstructed.amount.value, payment.amount.value);
    assertEquals(reconstructed.status.value, 'success');
});

Deno.test('[Unit] - PaymentDocumentMapper - toDocument - includes _id field', () => {
    const payment = Payment.create(
        'provider-12345',
        'Credit Card',
        '4111111111111111',
        '12/2028',
        '123',
        '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        1100,
    );

    const mapper = new PaymentDocumentMapper();
    const doc = mapper.toDocument(payment);

    assertEquals((doc as Record<string, unknown>)._id, payment.id.value);
    assertEquals((doc as Record<string, unknown>).externalId, payment.externalId.value);
    assertEquals((doc as Record<string, unknown>).paymentMethod, payment.paymentMethod.value);
    assertEquals((doc as Record<string, unknown>).amount, payment.amount.value);
});

Deno.test('[Unit] - PaymentDocumentMapper - reconstitute - failed payment - restores failure status', () => {
    const payment = Payment.create(
        'provider-12345',
        'Credit Card',
        '4111111111111111',
        '12/2028',
        '123',
        '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        1100,
    );

    payment.fail('declined by provider');

    const mapper = new PaymentDocumentMapper();
    const doc = mapper.toDocument(payment);
    const reconstructed = mapper.reconstitute(doc);

    assertEquals(reconstructed.status.value, 'failed');
});