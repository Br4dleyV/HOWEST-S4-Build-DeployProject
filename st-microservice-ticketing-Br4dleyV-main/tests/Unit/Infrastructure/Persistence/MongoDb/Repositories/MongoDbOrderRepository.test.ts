import { assertEquals } from '@std/assert';
import { Optional } from '@domaincrafters/std';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Order, OrderId } from '@/Domain/Ticketing/Orders/mod.ts';
import {
    MongoDbOrderRepository,
    OrderDocumentMapper,
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

Deno.test('[Unit] - MongoDbOrderRepository - save/byId/remove - persists orders', async () => {
    const repository = new MongoDbOrderRepository(createStubMongoDbClient(), new OrderDocumentMapper());
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );
    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    assertEquals(MongoDbOrderRepository.collectionName, 'orders');
    assertEquals(repository.entityName, Order.name);

    await repository.save(order);

    const stored = await repository.byId(OrderId.create(order.id.value));
    assertEquals(stored.isPresent, true);
    assertEquals(stored.getOrThrow().id.value, order.id.value);

    await repository.remove(order);
    const afterRemove = await repository.byId(OrderId.create(order.id.value));
    assertEquals(afterRemove.isPresent, false);
});
