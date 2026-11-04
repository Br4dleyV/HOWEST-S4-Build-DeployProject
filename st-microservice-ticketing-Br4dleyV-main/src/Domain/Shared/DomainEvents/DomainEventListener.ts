import { DomainEvent } from './DomainEvent.ts';

export interface DomainEventListener {
    listen<Event extends DomainEvent>(event: Event): void;
    subscribe(FQDN: string, handler: string): void;
    unsubscribe(FQDN: string, handler: string): void;
}
