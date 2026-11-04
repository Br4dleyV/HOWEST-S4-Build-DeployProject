import { AggregateRoot, EntityId } from '@/Domain/Shared/mod.ts';

export class InMemoryContext {
    private readonly _data: Map<string, Map<string, AggregateRoot<EntityId>>>;

    constructor(
        data: Map<string, Map<string, AggregateRoot<EntityId>>> = new Map<
            string,
            Map<string, AggregateRoot<EntityId>>
        >(),
    ) {
        this._data = data;
    }

    get data(): Map<string, Map<string, AggregateRoot<EntityId>>> {
        return this._data;
    }

    getAggregateRoots<TId extends EntityId, T extends AggregateRoot<TId>>(
        aggregateRootType: string,
    ): Map<string, T> {
        if (!this._data.has(aggregateRootType)) {
            // Create empty map for this aggregate type if it doesn't exist
            this._data.set(aggregateRootType, new Map<string, AggregateRoot<EntityId>>());
        }

        return this._data.get(aggregateRootType) as Map<string, T>;
    }

    registerAggregateRoot<TId extends EntityId, T extends AggregateRoot<TId>>(
        aggregateRoot: T,
    ): void {
        const aggregateType = aggregateRoot.constructor.name;

        if (!this._data.has(aggregateType)) {
            this._data.set(aggregateType, new Map<string, AggregateRoot<EntityId>>());
        }

        const aggregateMap = this._data.get(aggregateType)!;
        aggregateMap.set(aggregateRoot.id.toString(), aggregateRoot as AggregateRoot<EntityId>);
    }
}
