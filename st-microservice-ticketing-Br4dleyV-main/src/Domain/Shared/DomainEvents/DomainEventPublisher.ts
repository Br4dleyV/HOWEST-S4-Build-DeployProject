import { DomainEvent } from './DomainEvent.ts';
import { DomainEventListener } from './DomainEventListener.ts';

export interface DomainEventPublisher {
    publish<Event extends DomainEvent>(event: Event): Promise<void>;
    registerListener(eventListener: DomainEventListener): void;
}
