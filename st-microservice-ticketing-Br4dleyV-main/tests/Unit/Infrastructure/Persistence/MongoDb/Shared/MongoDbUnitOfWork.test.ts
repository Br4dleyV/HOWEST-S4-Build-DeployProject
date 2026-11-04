import { assertEquals, assertRejects } from '@std/assert';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { DEFAULT_RETRY_CONFIG, MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { MongoErrorCode } from '@/Infrastructure/Persistence/MongoDb/Shared/MongoDbUnitOfWork.ts';

function createSessionStub() {
    const state = {
        startTransactionCalled: 0,
        commitTransactionCalled: 0,
        abortTransactionCalled: 0,
        inTransactionValue: true,
        failCommitOnce: false,
    };

    const session = {
        startTransaction: () => {
            state.startTransactionCalled++;
        },
        commitTransaction: async () => {
            state.commitTransactionCalled++;
            if (state.failCommitOnce) {
                state.failCommitOnce = false;
                const error = new Error('write conflict');
                (error as { code?: number }).code = MongoErrorCode.WriteConflict;
                throw error;
            }
        },
        abortTransaction: async () => {
            state.abortTransactionCalled++;
        },
        inTransaction: () => state.inTransactionValue,
    };

    return { session: session as never, state };
}

function createRepository(name: string) {
    return {
        entityName: name,
        saveCalled: 0,
        removeCalled: 0,
        byId: async () => ({ isPresent: false, getOrThrow: () => undefined } as never),
        save: async () => {},
        remove: async () => {},
    };
}

Deno.test('[Unit] - MongoDbUnitOfWork - registerRepository/getRepository/save/remove - works with registered repositories', async () => {
    const { session } = createSessionStub();
    const unitOfWork = new MongoDbUnitOfWork(session);
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    assertEquals(unitOfWork.getRepository(Movie.name), repository);

    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    await unitOfWork.save(movie);
    await unitOfWork.remove(movie);
    assertEquals(unitOfWork.getTrackedEntityCount(), 2);
    assertEquals(unitOfWork.trackedEntities.length, 2);
    unitOfWork.clearTrackedEntities();
    assertEquals(unitOfWork.getTrackedEntityCount(), 0);
    assertEquals(unitOfWork.isEmpty(), true);
});

Deno.test('[Unit] - MongoDbUnitOfWork - registerRepository - missing or duplicate entityName - throws', async () => {
    const { session } = createSessionStub();
    const unitOfWork = new MongoDbUnitOfWork(session);

    await assertRejects(
        async () => unitOfWork.getRepository('Missing'),
        Error,
    );

    const repository = { entityName: Movie.name, byId: async () => undefined, save: async () => {}, remove: async () => {} };
    unitOfWork.registerRepository(repository as never);

    await assertRejects(
        async () => unitOfWork.registerRepository(repository as never),
        Error,
    );

    await assertRejects(
        async () => unitOfWork.registerRepository({ byId: async () => undefined, save: async () => {}, remove: async () => {} } as never),
        Error,
    );
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - retries transient errors and clears tracked entities', async () => {
    const { session, state } = createSessionStub();

    const unitOfWork = new MongoDbUnitOfWork(session, undefined, { maxRetries: 2, baseBackoffMs: 0 });
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    // Transactions are disabled, so transient errors now surface from the action itself.
    let attempts = 0;
    const result = await unitOfWork.do(async () => {
        attempts++;
        await unitOfWork.save(movie);
        if (attempts === 1) {
            const error = new Error('write conflict');
            (error as { code?: number }).code = MongoErrorCode.WriteConflict;
            throw error;
        }
        return 'ok';
    });

    assertEquals(result, 'ok');
    assertEquals(attempts, 2);
    assertEquals(unitOfWork.trackedEntities.length, 0);
    // Transactions are disabled: start/commit are never called.
    assertEquals(state.startTransactionCalled, 0);
    assertEquals(state.commitTransactionCalled, 0);
    // The transaction was reported active on the first (failed) attempt, so abort runs once.
    assertEquals(state.abortTransactionCalled, 1);
    assertEquals(unitOfWork.getTrackedEntityCount(), 0);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - aborts and rethrows non-retryable errors', async () => {
    const { session, state } = createSessionStub();
    const unitOfWork = new MongoDbUnitOfWork(session, undefined, DEFAULT_RETRY_CONFIG);

    await assertRejects(
        () => unitOfWork.do(async () => {
            throw new Error('business error');
        }),
        Error,
        'business error',
    );

    assertEquals(state.abortTransactionCalled, 1);
    assertEquals(unitOfWork.getTrackedEntityCount(), 0);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - runs interceptors after successful action', async () => {
    const { session, state } = createSessionStub();
    const unitOfWork = new MongoDbUnitOfWork(session);
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    let postCalled = 0;
    unitOfWork.setInterceptors([
        {
            pre: async () => {},
            post: async () => {
                postCalled++;
            },
        },
    ]);

    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    const result = await unitOfWork.do(async () => {
        await unitOfWork.save(movie);
        return 'ok';
    });

    assertEquals(result, 'ok');
    assertEquals(postCalled, 1);
    // Transactions are disabled: commit is never called.
    assertEquals(state.commitTransactionCalled, 0);
    assertEquals(unitOfWork.getTrackedEntityCount(), 0);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - retries on transient error label', async () => {
    const { session, state } = createSessionStub();

    const unitOfWork = new MongoDbUnitOfWork(session, undefined, { maxRetries: 2, baseBackoffMs: 0 });
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    let attempts = 0;
    const result = await unitOfWork.do(async () => {
        attempts++;
        await unitOfWork.save(movie);
        if (attempts === 1) {
            const error = new Error('transient error');
            (error as { errorLabels?: string[] }).errorLabels = ['TransientTransactionError'];
            throw error;
        }
        return 'success';
    });

    assertEquals(result, 'success');
    assertEquals(attempts, 2);
    assertEquals(state.startTransactionCalled, 0);
    assertEquals(state.commitTransactionCalled, 0);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - exhausts retries and throws', async () => {
    const { session, state } = createSessionStub();

    const unitOfWork = new MongoDbUnitOfWork(session, undefined, { maxRetries: 2, baseBackoffMs: 0 });
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    await assertRejects(
        () => unitOfWork.do(async () => {
            await unitOfWork.save(movie);
            const error = new Error('persistent write conflict');
            (error as { code?: number }).code = MongoErrorCode.WriteConflict;
            throw error;
        }),
        Error,
        'persistent write conflict',
    );

    assertEquals(state.startTransactionCalled, 0);
    assertEquals(state.commitTransactionCalled, 0);
    // Aborts once per attempt (maxRetries = 2).
    assertEquals(state.abortTransactionCalled, 2);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - aborts when not in transaction on error', async () => {
    const { session, state } = createSessionStub();
    state.inTransactionValue = false;

    const unitOfWork = new MongoDbUnitOfWork(session);
    const repository = createRepository(Movie.name);
    unitOfWork.registerRepository(repository as never);

    await assertRejects(
        () => unitOfWork.do(async () => {
            throw new Error('boom');
        }),
    );

    assertEquals(state.abortTransactionCalled, 0);
});

Deno.test('[Unit] - MongoDbUnitOfWork - do - does not retry non-transient labeled errors', async () => {
    const { session, state } = createSessionStub();

    const unitOfWork = new MongoDbUnitOfWork(session, undefined, { maxRetries: 3, baseBackoffMs: 0 });

    await assertRejects(
        () => unitOfWork.do(async () => {
            const error = new Error('non transient label');
            (error as { errorLabels?: string[] }).errorLabels = ['SomeOtherLabel'];
            throw error;
        }),
        Error,
        'non transient label',
    );

    assertEquals(state.startTransactionCalled, 0);
    assertEquals(state.commitTransactionCalled, 0);
    assertEquals(state.abortTransactionCalled, 1);
});

Deno.test('[Unit] - MongoDbUnitOfWork - save/remove - without registered repository - throws', async () => {
    const { session } = createSessionStub();
    const unitOfWork = new MongoDbUnitOfWork(session);
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama', 'Thriller'],
        'https://example.com/poster.png',
        '12+',
    );

    await assertRejects(() => unitOfWork.save(movie), Error);
    await assertRejects(() => unitOfWork.remove(movie), Error);
});
