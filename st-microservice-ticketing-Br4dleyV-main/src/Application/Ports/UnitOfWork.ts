import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';

export interface UnitOfWork {
    /**
     * Executes the action inside a transactional Unit of Work boundary.
     * Implementations commit on success and rollback on failure.
     */
    do<Output>(action: () => Promise<Output>): Promise<Output>;

    /**
     * Returns a registered repository by aggregate name.
     * Use this repository to fetch/read aggregate state (for example byId or custom queries).
     */
    getRepository<T extends Repository<AggregateRoot<EntityId>, EntityId>>(
        aggregateName: string,
    ): T;

    /**
     * Persists an aggregate via the repository registered in this Unit of Work.
     * The concrete implementation resolves the repository from its internal registry.
     */
    save<TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void>;

    /**
     * Removes an aggregate via the repository registered in this Unit of Work.
     * The concrete implementation resolves the repository from its internal registry.
     */
    remove<TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void>;
}
