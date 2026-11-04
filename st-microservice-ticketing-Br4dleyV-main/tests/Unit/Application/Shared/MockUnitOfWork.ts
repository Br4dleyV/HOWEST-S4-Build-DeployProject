import type { UnitOfWork } from '@/Application/Ports/mod.ts';
import type { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import type { DomainEventPublisher } from '@/Domain/Shared/DomainEvents/DomainEventPublisher.ts';
import { createMockDomainEventBus } from './MockDomainEventBus.ts';

/**
 * Options for creating a mock UnitOfWork
 */
interface MockUnitOfWorkOptions {
    /**
     * Whether the UnitOfWork should throw an error when executing actions
     * Default: false
     */
    shouldThrow?: boolean;

    /**
     * Custom error message to throw when shouldThrow is true
     * Default: 'UnitOfWork error'
     */
    errorMessage?: string;

    /**
     * Custom event bus for testing event publishing
     * Default: createMockDomainEventBus()
     */
    eventBus?: DomainEventPublisher;

    /**
     * Repositories to register with the UnitOfWork
     * Default: empty map
     */
    repositories?: Map<string, Repository<AggregateRoot<EntityId>, EntityId>>;
}

/**
 * Creates a mock UnitOfWork for testing transaction boundaries and event tracking
 *
 * @param options - Override options
 * @returns Mock UnitOfWork with tracking properties
 *
 * @example
 * ```typescript
 * // Basic usage - verify transaction is used
 * const mockRepo = createMockTournamentRepository();
 * const repositories = new Map([['Tournament', mockRepo]]);
 * const mockUnitOfWork = createMockUnitOfWork({ repositories });
 * await useCase.execute(input);
 * assertEquals(mockUnitOfWork.doCalled, true);
 *
 * // Verify entity saving
 * const mockRepo = createMockTournamentRepository();
 * const repositories = new Map([['Tournament', mockRepo]]);
 * const mockUnitOfWork = createMockUnitOfWork({ repositories });
 * await useCase.execute(input);
 * assertEquals(mockUnitOfWork.saveCalled, true);
 *
 * // Verify events were published
 * const mockEventBus = createMockDomainEventBus();
 * const mockRepo = createMockTournamentRepository();
 * const repositories = new Map([['Tournament', mockRepo]]);
 * const mockUnitOfWork = createMockUnitOfWork({ eventBus: mockEventBus, repositories });
 * await useCase.execute(input);
 * assertEquals(mockEventBus.publishAllCalled, true);
 *
 * // Simulate transaction error
 * const mockRepo = createMockTournamentRepository();
 * const repositories = new Map([['Tournament', mockRepo]]);
 * const mockUnitOfWork = createMockUnitOfWork({ shouldThrow: true, repositories });
 * await assertRejects(
 *     () => useCase.execute(input),
 *     Error,
 *     'UnitOfWork error'
 * );
 * ```
 */
export function createMockUnitOfWork(
    options: MockUnitOfWorkOptions = {},
): UnitOfWork & {
    doCalled: boolean;
    doCallCount: number;
    saveCalled: boolean;
    saveCallCount: number;
    removeCalled: boolean;
    removeCallCount: number;
    getRepositoryCalled: boolean;
    getRepositoryCallCount: number;
    trackedEntities: AggregateRoot<EntityId>[];
    savedEntities: AggregateRoot<EntityId>[];
    removedEntities: AggregateRoot<EntityId>[];
    eventBus: DomainEventPublisher;
} {
    const trackedEntities: AggregateRoot<EntityId>[] = [];
    const savedEntities: AggregateRoot<EntityId>[] = [];
    const removedEntities: AggregateRoot<EntityId>[] = [];
    const eventBus = options.eventBus || createMockDomainEventBus();
    const repositories = options.repositories || new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>();

    const mock = {
        doCalled: false,
        doCallCount: 0,
        saveCalled: false,
        saveCallCount: 0,
        removeCalled: false,
        removeCallCount: 0,
        getRepositoryCalled: false,
        getRepositoryCallCount: 0,
        trackedEntities,
        savedEntities,
        removedEntities,
        eventBus,

        getRepository: <T extends Repository<AggregateRoot<EntityId>, EntityId>>(aggregateName: string): T => {
            mock.getRepositoryCalled = true;
            mock.getRepositoryCallCount++;
            
            const repository = repositories.get(aggregateName);
            if (!repository) {
                throw new Error(
                    `No repository registered for aggregate type '${aggregateName}'. ` +
                    `Did you forget to call unitOfWork.registerRepository('${aggregateName}', repository)?`
                );
            }
            
            return repository as T;
        },

        save: async <TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void> => {
            mock.saveCalled = true;
            mock.saveCallCount++;
            
            const aggregateType = aggregate.constructor.name;
            const repository = repositories.get(aggregateType);
            
            if (repository) {
                await repository.save(aggregate as AggregateRoot<EntityId>);
            }
            
            savedEntities.push(aggregate as AggregateRoot<EntityId>);
            if (!trackedEntities.includes(aggregate as AggregateRoot<EntityId>)) {
                trackedEntities.push(aggregate as AggregateRoot<EntityId>);
            }
        },

        remove: async <TId extends EntityId>(aggregate: AggregateRoot<TId>): Promise<void> => {
            mock.removeCalled = true;
            mock.removeCallCount++;
            
            const aggregateType = aggregate.constructor.name;
            const repository = repositories.get(aggregateType);
            
            if (repository) {
                await repository.remove(aggregate as AggregateRoot<EntityId>);
            }
            
            removedEntities.push(aggregate as AggregateRoot<EntityId>);
            if (!trackedEntities.includes(aggregate as AggregateRoot<EntityId>)) {
                trackedEntities.push(aggregate as AggregateRoot<EntityId>);
            }
        },

        do: async <Output>(action: () => Promise<Output>): Promise<Output> => {
            // Clear tracked entities from previous transaction
            trackedEntities.length = 0;
            savedEntities.length = 0;
            removedEntities.length = 0;

            mock.doCalled = true;
            mock.doCallCount++;

            if (options.shouldThrow) {
                throw new Error(options.errorMessage || 'UnitOfWork error');
            }

            // Execute the action
            const result = await action();

            // Simulate event publishing after successful transaction
            const events = trackedEntities
                .filter((entity): entity is AggregateRoot<EntityId> => 
                    entity instanceof Object && 'hasDomainEvents' in entity && 
                    typeof (entity as any).hasDomainEvents === 'function' &&
                    (entity as any).hasDomainEvents()
                )
                .flatMap((aggregate) => aggregate.pullDomainEvents());

            for (const event of events) {
                await eventBus.publish(event);
            }

            return result;
        },
    };

    return mock as UnitOfWork & {
        doCalled: boolean;
        doCallCount: number;
        saveCalled: boolean;
        saveCallCount: number;
        removeCalled: boolean;
        removeCallCount: number;
        getRepositoryCalled: boolean;
        getRepositoryCallCount: number;
        trackedEntities: AggregateRoot<EntityId>[];
        savedEntities: AggregateRoot<EntityId>[];
        removedEntities: AggregateRoot<EntityId>[];
        eventBus: DomainEventPublisher;
    };
}
