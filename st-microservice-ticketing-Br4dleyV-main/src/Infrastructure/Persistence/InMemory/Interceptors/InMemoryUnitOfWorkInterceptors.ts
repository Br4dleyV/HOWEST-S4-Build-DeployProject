import type { DomainEventPublisher } from '@/Domain/Shared/mod.ts';
import { UnitOfWorkInterceptor } from '@/Infrastructure/Persistence/Shared/mod.ts';
import { InMemoryUnitOfWork } from '../Shared/mod.ts';

export class PublishDomainEventsInMemoryUnitOfWorkInterceptor implements UnitOfWorkInterceptor {
    private readonly _eventPublisher: DomainEventPublisher;
    private readonly _uow: InMemoryUnitOfWork;

    constructor(
        uow: InMemoryUnitOfWork,
        eventPublisher: DomainEventPublisher,
    ) {
        this._eventPublisher = eventPublisher;
        this._uow = uow;
    }
    pre(): Promise<void> {
        return Promise.resolve();
    }

    async post(): Promise<void> {
        const publishTasks: Promise<void>[] = [];

        for (const aggregate of this._uow.trackedEntities) {
            if (
                'pullDomainEvents' in aggregate &&
                typeof aggregate.pullDomainEvents === 'function'
            ) {
                const events = aggregate.pullDomainEvents();

                for (const event of events) {
                    publishTasks.push(this._eventPublisher.publish(event));
                }
            }
        }

        await Promise.all(publishTasks);
    }
}
