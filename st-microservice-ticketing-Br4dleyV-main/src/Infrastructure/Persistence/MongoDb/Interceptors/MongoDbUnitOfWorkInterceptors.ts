import { DomainEventPublisher } from '@/Domain/Shared/mod.ts';
import { UnitOfWorkInterceptor } from '@/Infrastructure/Persistence/Shared/mod.ts';
import { MongoDbUnitOfWork } from '../Shared/mod.ts';

export class PublishDomainEventsMongoDbUnitOfWorkInterceptor implements UnitOfWorkInterceptor {
    private readonly _eventPublisher: DomainEventPublisher;
    private readonly _uow: MongoDbUnitOfWork;

    constructor(
        uow: MongoDbUnitOfWork,
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

        for (const aggregateRoot of this._uow.trackedEntities) {
            if (
                'pullDomainEvents' in aggregateRoot &&
                typeof aggregateRoot.pullDomainEvents === 'function'
            ) {
                const events = aggregateRoot.pullDomainEvents();

                for (const event of events) {
                    publishTasks.push(this._eventPublisher.publish(event));
                }
            }
        }

        await Promise.all(publishTasks);
    }
}
