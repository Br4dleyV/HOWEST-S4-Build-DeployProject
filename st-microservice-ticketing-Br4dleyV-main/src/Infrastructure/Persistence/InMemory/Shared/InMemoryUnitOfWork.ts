import type { UnitOfWork } from '@/Application/Ports/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { type UnitOfWorkInterceptor } from '@/Infrastructure/Persistence/Shared/mod.ts';

export class InMemoryUnitOfWork implements UnitOfWork {
    private _trackedEntities: AggregateRoot<EntityId>[] = [];
    private readonly _repositories: Map<string, Repository<AggregateRoot<EntityId>, EntityId>> =
        new Map();
    private _interceptors: UnitOfWorkInterceptor[] = [];

    constructor(
        repositories: Map<string, Repository<AggregateRoot<EntityId>, EntityId>>,
    ) {
        this._interceptors = [];
        this._repositories = repositories;
    }

    setInterceptors(interceptors: UnitOfWorkInterceptor[]): void {
        this._interceptors = interceptors;
    }

    getRepository<T extends Repository<AggregateRoot<EntityId>, EntityId>>(
        aggregateName: string,
    ): T {
        const repository = this._repositories.get(aggregateName);

        if (!repository) {
            throw new Error(
                `No repository registered for aggregate type '${aggregateName}'. ` +
                    `Did you forget to call unitOfWork.registerRepository('${aggregateName}', repository)?`,
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
            throw new Error(
                `No repository registered for aggregate type '${aggregateType}'. ` +
                    `Did you forget to call unitOfWork.registerRepository('${aggregateType}', repository)?`,
            );
        }

        // Save via repository
        await repository.save(aggregate as AggregateRoot<EntityId>);

        // Automatically track for event publishing
        this.track(aggregate as AggregateRoot<EntityId>);
    }

    async remove<TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void> {
        const aggregateType = aggregate.constructor.name;
        const repository = this._repositories.get(aggregateType);

        if (!repository) {
            throw new Error(
                `No repository registered for aggregate type '${aggregateType}'. ` +
                    `Did you forget to call unitOfWork.registerRepository('${aggregateType}', repository)?`,
            );
        }

        // Remove via repository
        await repository.remove(aggregate as AggregateRoot<EntityId>);

        // Automatically track for event publishing (removal events)
        this.track(aggregate as AggregateRoot<EntityId>);
    }

    async do<Output>(action: () => Promise<Output>): Promise<Output> {
        try {
            // verzamelen
            // interceptor.pre()
            const result = await action();
            await this.executePost();
            this._trackedEntities = [];

            return result;
        } catch (error: unknown) {
            this._trackedEntities = [];
            throw error;
        }
    }

    private async executePost(): Promise<void> {
        for (const interceptor of this._interceptors) {
            await interceptor.post();
        }
    }

    private track(aggregate: AggregateRoot<EntityId>): void {
        this._trackedEntities.push(aggregate);
    }

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
