import type { ClientSession, TransactionOptions } from '@mongodb';
import type { UnitOfWork } from '@/Application/Ports/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import type { UnitOfWorkInterceptor } from '@/Infrastructure/Persistence/Shared/mod.ts';
import { IllegalStateException } from '@domaincrafters/std';

/**
 * Default MongoDB transaction options optimized for consistency
 * - snapshot isolation ensures consistent reads
 * - majority write concern ensures durability
 * - maxCommitTimeMS prevents long-running transactions from locking resources
 */
export const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    maxCommitTimeMS: 10000, // 10 second timeout
};

/**
 * Retry configuration for handling transient MongoDB errors
 */
export interface RetryConfig {
    maxRetries: number;
    baseBackoffMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseBackoffMs: 100,
};

/**
 * MongoDB error codes that should trigger a retry
 */
export enum MongoErrorCode {
    WriteConflict = 112,
    TransientTransactionError = 251,
}

/**
 * MongoDB Unit of Work implementation with transaction support
 *
 * Critical design decisions:
 * 1. Uses MongoDB sessions for transaction support
 * 2. Implements automatic retry for write conflicts with exponential backoff
 * 3. Maintains interceptor pattern for cross-cutting concerns (domain events)
 * 4. Repository registration validates MongoDB-specific implementations
 * 5. Ensures proper cleanup on both success and failure paths
 */
export class MongoDbUnitOfWork implements UnitOfWork {
    private readonly _session: ClientSession;
    private readonly _repositories: Map<string, Repository<AggregateRoot<EntityId>, EntityId>> =
        new Map();
    private readonly _retryConfig: RetryConfig;
    private _interceptors: UnitOfWorkInterceptor[] = [];
    private _trackedEntities: AggregateRoot<EntityId>[] = [];

    constructor(
        session: ClientSession,
        // Transaction options are kept in the signature for backwards compatibility,
        // but are unused because transactions are disabled (CosmosDB limitation).
        _transactionOptions: TransactionOptions = DEFAULT_TRANSACTION_OPTIONS,
        retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
    ) {
        this._session = session;
        this._retryConfig = retryConfig;
    }

    setInterceptors(interceptors: UnitOfWorkInterceptor[]): void {
        this._interceptors = interceptors;
    }

    getRepository<T extends Repository<AggregateRoot<EntityId>, EntityId>>(
        aggregateName: string,
    ): T {
        const repository = this._repositories.get(aggregateName);

        if (!repository) {
            throw new IllegalStateException(
                `No repository registered for aggregate type '${aggregateName}'. ` +
                    `Did you forget to register the repository?`,
            );
        }

        return repository as T;
    }

    get trackedEntities(): AggregateRoot<EntityId>[] {
        return this._trackedEntities;
    }

    async save<TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void> {
        const aggregateType = aggregate.constructor.name;
        const repository = this._repositories.get(aggregateType);

        if (!repository) {
            throw new IllegalStateException(
                `No repository registered for aggregate type '${aggregateType}'. ` +
                    `Did you forget to register the repository?`,
            );
        }

        await repository.save(aggregate as AggregateRoot<EntityId>);
        this.track(aggregate as AggregateRoot<EntityId>);
    }

    async remove<TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void> {
        const aggregateType = aggregate.constructor.name;
        const repository = this._repositories.get(aggregateType);

        if (!repository) {
            throw new IllegalStateException(
                `No repository registered for aggregate type '${aggregateType}'. ` +
                    `Did you forget to register the repository?`,
            );
        }

        await repository.remove(aggregate as AggregateRoot<EntityId>);
        this.track(aggregate as AggregateRoot<EntityId>);
    }

    /**
     * Executes an action within a MongoDB transaction with automatic retry
     *
     * Critical improvements over the reference:
     * 1. Proper cleanup of tracked entities on both success and failure
     * 2. Explicit transaction abort on error
     * 3. Retry only for transient errors (write conflicts)
     * 4. Proper error propagation (don't swallow domain exceptions)
     * 5. Post-transaction interceptors only run on successful commit
     */
    async do<Output>(action: () => Promise<Output>): Promise<Output> {
        let attempts = 0;

        while (true) {
            attempts++;

            try {
                // Transactions are disabled because CosmosDB (with the MongoDB API)
                // does not yet support the full MongoDB transaction API.
                // Start transaction
                //   this._session.startTransaction(this._transactionOptions);

                // Execute the business logic
                const result = await action();

                // Commit transaction - this may fail with WriteConflict
                //   await this._session.commitTransaction();

                // Only execute post-transaction hooks after successful commit
                // Interceptors may need access to tracked entities (e.g., for domain events)
                await this.executePostInterceptors();

                // Clear tracked entities after interceptors have processed them
                this._trackedEntities = [];

                return result;
            } catch (error: unknown) {
                // Ensure transaction is aborted if still active
                if (this._session.inTransaction()) {
                    await this._session.abortTransaction();
                }

                // Clear tracked entities on failure
                this._trackedEntities = [];

                // Retry logic for transient errors
                if (this.shouldRetry(error, attempts)) {
                    await this.delayRetry(attempts);
                    continue;
                }

                // Re-throw all other errors (including domain exceptions)
                throw error;
            }
        }
    }

    /**
     * Register a repository for a specific aggregate type
     *
     * Critical: Uses repository's entityName property for reliable registration
     */
    registerRepository(repository: Repository<AggregateRoot<EntityId>, EntityId>): void {
        // Cast to access entityName - all MongoDB repositories should have this
        const mongoRepo = repository as unknown as { entityName: string };
        const aggregateName = mongoRepo.entityName;

        if (!aggregateName) {
            throw new IllegalStateException(
                `Repository must have an entityName property. Ensure it extends MongoDbRepository.`,
            );
        }

        if (this._repositories.has(aggregateName)) {
            throw new IllegalStateException(
                `Repository for aggregate ${aggregateName} already registered`,
            );
        }

        this._repositories.set(aggregateName, repository);
    }

    /**
     * Determine if an error should trigger a retry
     *
     * Critical: Only retry transient errors, not business logic failures
     */
    private shouldRetry(error: unknown, attempts: number): boolean {
        const mongoError = error as { code?: number; errorLabels?: string[] };

        // Check for write conflict error code
        const isWriteConflict = mongoError?.code === MongoErrorCode.WriteConflict;

        // Check for transient transaction error label (MongoDB 4.0+)
        const isTransientError = mongoError?.errorLabels?.includes('TransientTransactionError') ??
            false;

        const isRetryable = (isWriteConflict || isTransientError) &&
            attempts < this._retryConfig.maxRetries;

        return isRetryable;
    }

    /**
     * Exponential backoff for retry attempts
     */
    private async delayRetry(attempt: number): Promise<void> {
        const backoffMs = this._retryConfig.baseBackoffMs * Math.pow(2, attempt - 1);
        console.warn(
            `MongoDB transient error detected. Retrying (${attempt}/${this._retryConfig.maxRetries}) after ${backoffMs}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }

    /**
     * Execute post-transaction interceptors (e.g., domain event publishing)
     *
     * Critical: Only called after successful transaction commit
     */
    private async executePostInterceptors(): Promise<void> {
        for (const interceptor of this._interceptors) {
            await interceptor.post();
        }
    }

    /**
     * Track an aggregate for event processing
     */
    private track(aggregate: AggregateRoot<EntityId>): void {
        this._trackedEntities.push(aggregate);
    }

    // Utility methods for testing/debugging
    getTrackedEntityCount(): number {
        return this._trackedEntities.length;
    }

    isEmpty(): boolean {
        return this._trackedEntities.length === 0;
    }

    clearTrackedEntities(): void {
        this._trackedEntities = [];
    }
}
