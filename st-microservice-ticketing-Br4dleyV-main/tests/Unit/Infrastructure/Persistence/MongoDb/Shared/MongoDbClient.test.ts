import { assertEquals, assertRejects, assertThrows } from '@std/assert';
import type {
    Collection,
    CreateCollectionOptions,
    Document,
    MongoClient,
} from '@mongodb';

import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

function createSessionStub() {
    return {
        endSessionCalled: false,
        endSession() {
            (this as { endSessionCalled: boolean }).endSessionCalled = true;
        },
    } as any;
}

function createMongoClientStub() {
    const state = {
        connectCalled: 0,
        closeCalled: 0,
        startSessionCalled: 0,
        lastCollectionName: '',
        lastFilter: undefined as unknown,
        lastUpdateFilter: undefined as unknown,
        lastUpdateDocument: undefined as unknown,
        lastDeleteFilter: undefined as unknown,
        lastInsertDocument: undefined as unknown,
        lastInsertManyDocuments: undefined as unknown,
        listCollectionsResult: [] as Array<{ name: string }>,
        findOneResult: null as Document | null,
        updateOneResult: { acknowledged: true, matchedCount: 1, upsertedCount: 0 },
        insertOneResult: { acknowledged: true, insertedId: 'inserted-id' },
        insertManyResult: { acknowledged: true, insertedCount: 2, insertedIds: { 0: 'a', 1: 'b' } },
        deleteOneResult: { acknowledged: true, deletedCount: 1 },
        aggregateResult: [{ id: '1' }],
        createCollectionCalled: 0,
    };

    const collection: any = {
        findOne: async (filter: unknown) => {
            state.lastFilter = filter;
            return state.findOneResult;
        },
        updateOne: async (filter: unknown, document: unknown) => {
            state.lastUpdateFilter = filter;
            state.lastUpdateDocument = document;
            return state.updateOneResult;
        },
        insertOne: async (document: unknown) => {
            state.lastInsertDocument = document;
            return state.insertOneResult;
        },
        insertMany: async (documents: unknown) => {
            state.lastInsertManyDocuments = documents;
            return state.insertManyResult;
        },
        deleteOne: async (filter: unknown) => {
            state.lastDeleteFilter = filter;
            return state.deleteOneResult;
        },
        find: () => ({ toArray: async () => [{ _id: '1' }] }),
        aggregate: () => ({ toArray: async () => state.aggregateResult }),
    };

    const db = {
        listCollections: () => ({ toArray: async () => state.listCollectionsResult }),
        createCollection: async (_collectionName: string, _options: CreateCollectionOptions) => {
            state.createCollectionCalled++;
        },
        collection: (_collectionName: string) => {
            state.lastCollectionName = _collectionName;
            return collection;
        },
    };

    const client: any = {
        options: { dbName: 'howestprime-ticketing' },
        db: () => db,
        connect: async () => {
            state.connectCalled++;
        },
        close: async () => {
            state.closeCalled++;
        },
        startSession: () => {
            state.startSessionCalled++;
            return createSessionStub();
        },
    } as unknown as MongoClient;

    return { client, state, collection, db };
}

Deno.test('[Unit] - MongoDbClient - createConnectionString - empty credentials', () => {
    const connectionString = MongoDbClient.createConnectionString(
        'mongodb',
        'localhost',
        '40131',
        'authSource=admin',
        'howestprime-ticketing',
        '',
        '',
    );

    assertEquals(
        connectionString,
        'mongodb://localhost:40131/howestprime-ticketing?authSource=admin',
    );
});

Deno.test('[Unit] - MongoDbClient - createConnectionString - validation failures', () => {
    assertThrows(() => MongoDbClient.createConnectionString('', 'localhost', '40131', '', 'db', '', ''), Error);
    assertThrows(() => MongoDbClient.createConnectionString('mongodb', '', '40131', '', 'db', '', ''), Error);
    assertThrows(() => MongoDbClient.createConnectionString('mongodb', 'localhost', '-1', '', 'db', '', ''), Error);
    assertThrows(() => MongoDbClient.createConnectionString('mongodb', 'localhost', 'abc', '', 'db', '', ''), Error);
    assertThrows(() => MongoDbClient.createConnectionString('mongodb', 'localhost', '40131', '', '', '', ''), Error);
    assertThrows(() => MongoDbClient.createConnectionString('mongodb', 'localhost', '40131', '', '   ', '', ''), Error);
});

Deno.test('[Unit] - MongoDbClient - createConnectionString - partial credentials - omits auth segment', () => {
    const connectionStringWithUserOnly = MongoDbClient.createConnectionString(
        'mongodb',
        'localhost',
        '40131',
        'authSource=admin',
        'howestprime-ticketing',
        'user',
        '',
    );

    const connectionStringWithPasswordOnly = MongoDbClient.createConnectionString(
        'mongodb',
        'localhost',
        '40131',
        'authSource=admin',
        'howestprime-ticketing',
        '',
        'pass',
    );

    assertEquals(
        connectionStringWithUserOnly,
        'mongodb://localhost:40131/howestprime-ticketing?authSource=admin',
    );
    assertEquals(
        connectionStringWithPasswordOnly,
        'mongodb://localhost:40131/howestprime-ticketing?authSource=admin',
    );
});

Deno.test('[Unit] - MongoDbClient - session getter - creates session only once until reset', async () => {
    const { client } = createMongoClientStub();
    const mongoDbClient2 = new MongoDbClient(client);

    const session1 = mongoDbClient2.session;
    const session2 = mongoDbClient2.session;
    assertEquals(session1, session2);
});

Deno.test('[Unit] - MongoDbClient - connect - without existing session', async () => {
    const { state } = createMongoClientStub();
    const client2: any = {
        options: { dbName: 'howestprime-ticketing' },
        db: () => ({}),
        connect: async () => {
            state.connectCalled++;
        },
        startSession: () => {
            state.startSessionCalled++;
            return createSessionStub();
        },
    } as unknown as MongoClient;

    const mongoDbClient2 = new MongoDbClient(client2);
    await mongoDbClient2.connect();
    assertEquals(state.connectCalled, 1);
});

Deno.test('[Unit] - MongoDbClient - close - without existing session', async () => {
    const { state } = createMongoClientStub();
    const client2: any = {
        options: { dbName: 'howestprime-ticketing' },
        db: () => ({}),
        close: async () => {
            state.closeCalled++;
        },
        startSession: () => createSessionStub(),
    } as unknown as MongoClient;

    const mongoDbClient2 = new MongoDbClient(client2);
    // Don't access session - leave it as undefined
    await mongoDbClient2.close();
    assertEquals(state.closeCalled, 1);
});

Deno.test('[Unit] - MongoDbClient - collection/session/find/create/update/insert/delete/all - uses underlying client', async () => {
    const { client, state, collection } = createMongoClientStub();
    const mongoDbClient = new MongoDbClient(client);

    assertEquals(mongoDbClient.collection('movies'), collection);
    assertEquals(state.lastCollectionName, 'movies');

    assertEquals(mongoDbClient.session !== undefined, true);
    assertEquals(state.startSessionCalled, 1);

    state.findOneResult = { _id: '1' } as Document;
    const document = await mongoDbClient.findDocument({ _id: '1' } as never, 'movies');
    assertEquals(document.isPresent, true);

    state.findOneResult = null;
    const missingDocument = await mongoDbClient.findDocument({ _id: '2' } as never, 'movies');
    assertEquals(missingDocument.isPresent, false);

    await mongoDbClient.createCollection('movies');
    assertEquals(state.createCollectionCalled, 1);

    state.listCollectionsResult = [{ name: 'movies' }];
    await mongoDbClient.createCollection('movies');
    assertEquals(state.createCollectionCalled, 1);

    await mongoDbClient.upsertDocument({ _id: '1' } as never, { value: 1 } as Document, 'movies');
    assertEquals(state.lastUpdateFilter, { _id: '1' });
    assertEquals(state.lastUpdateDocument, { $set: { value: 1 } });

    await mongoDbClient.insertDocument({ _id: '2' } as Document, 'movies');
    assertEquals(state.lastInsertDocument, { _id: '2' });

    await mongoDbClient.insertManyDocuments([{ _id: '3' } as Document, { _id: '4' } as Document], 'movies');
    assertEquals(Array.isArray(state.lastInsertManyDocuments), true);

    await mongoDbClient.deleteDocument({ _id: '2' } as never, 'movies');
    assertEquals(state.lastDeleteFilter, { _id: '2' });

    assertEquals(await mongoDbClient.findDocumentsByPipeline([{ $match: {} }] as never, 'movies'), [{ id: '1' }]);
    assertEquals(await mongoDbClient.all('movies'), [{ _id: '1' }]);

    const currentSession = mongoDbClient.session as any;
    mongoDbClient.endSession();
    assertEquals(currentSession.endSessionCalled, true);

    const newSession = mongoDbClient.session as any;
    assertEquals(newSession !== currentSession, true);

    await mongoDbClient.connect();
    assertEquals(state.connectCalled, 1);

    const reopenedSession = mongoDbClient.session as any;
    assertEquals(reopenedSession !== newSession, true);

    await mongoDbClient.close();
    assertEquals(state.closeCalled, 1);
});

Deno.test('[Unit] - MongoDbClient - document operations without session - forwards undefined session', async () => {
    const { client, state } = createMongoClientStub();
    const mongoDbClient = new MongoDbClient(client);

    await mongoDbClient.findDocument({ _id: '1' } as never, 'movies');
    await mongoDbClient.upsertDocument({ _id: '1' } as never, { value: 1 } as Document, 'movies');
    await mongoDbClient.insertDocument({ _id: '2' } as Document, 'movies');
    await mongoDbClient.insertManyDocuments([{ _id: '3' } as Document], 'movies');
    await mongoDbClient.deleteDocument({ _id: '2' } as never, 'movies');
    await mongoDbClient.findDocumentsByPipeline([{ $match: {} }] as never, 'movies');

    assertEquals(state.lastFilter, { _id: '1' });
    assertEquals(state.lastUpdateFilter, { _id: '1' });
    assertEquals(state.lastInsertDocument, { _id: '2' });
    assertEquals(Array.isArray(state.lastInsertManyDocuments), true);
    assertEquals(state.lastDeleteFilter, { _id: '2' });
});

Deno.test('[Unit] - MongoDbClient - endSession - without session - no-op', () => {
    const { client } = createMongoClientStub();
    const mongoDbClient = new MongoDbClient(client);

    mongoDbClient.endSession();
});

Deno.test('[Unit] - MongoDbClient - createCollection/connect/close - converts errors to IllegalStateException', async () => {
    const client: any = {
        options: { dbName: 'howestprime-ticketing' },
        db: () => ({
            listCollections: () => ({ toArray: async () => { throw new Error('boom'); } }),
            createCollection: async () => {},
            collection: () => ({}) as Collection<Document>,
        }),
        connect: async () => { throw new Error('connect failed'); },
        close: async () => { throw new Error('close failed'); },
        startSession: () => createSessionStub(),
    } as unknown as MongoClient;

    const mongoDbClient = new MongoDbClient(client);

    await assertRejects(() => mongoDbClient.createCollection('movies'), Error, 'Failed to create collection movies');
    await assertRejects(() => mongoDbClient.connect(), Error, 'Failed to connect to MongoDB');
    await assertRejects(() => mongoDbClient.close(), Error, 'Failed to close MongoDB connection');
});

Deno.test('[Unit] - MongoDbClient - createConnectionString - full credentials - includes auth segment', () => {
    const connectionString = MongoDbClient.createConnectionString(
        'mongodb',
        'localhost',
        '40131',
        'authSource=admin',
        'howestprime-ticketing',
        'admin',
        'password123',
    );

    assertEquals(
        connectionString,
        'mongodb://admin:password123@localhost:40131/howestprime-ticketing?authSource=admin',
    );
});