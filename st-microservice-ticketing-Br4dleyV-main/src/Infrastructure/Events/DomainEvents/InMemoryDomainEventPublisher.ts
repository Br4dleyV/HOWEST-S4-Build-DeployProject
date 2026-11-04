import { DomainEvent, DomainEventListener, DomainEventPublisher } from '@/Domain/Shared/mod.ts';

export class InMemoryDomainEventPublisher implements DomainEventPublisher {
    private readonly _listeners: DomainEventListener[] = [];

    constructor(listeners: DomainEventListener[] = []) {
        this._listeners = listeners;
    }

    async publish<Event extends DomainEvent>(event: Event): Promise<void> {
        console.log(`Publishing event: ${event.constructor.name}`);
        await Promise.all(
            this._listeners.map((listener) => Promise.resolve(listener.listen(event))),
        );
    }

    registerListener(eventListener: DomainEventListener): void {
        console.log(`Registering event listener: ${eventListener.constructor.name}`);
        this._listeners.push(eventListener);
    }
}
