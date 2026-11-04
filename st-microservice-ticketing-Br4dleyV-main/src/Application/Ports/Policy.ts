import type { DomainEvent } from '@/Domain/Shared/DomainEvents/DomainEvent.ts';

/**
 * Domain Policy Interface
 *
 * Policies react to domain events and enforce consistency or side effects.
 *
 * @template TEvent - The type of domain event this policy handles
 */
export interface Policy<TEvent extends DomainEvent> {
    /**
     * Handle the domain event
     *
     * @param event - The domain event to handle
     * @returns Promise that resolves when the event has been handled
     */
    handle(event: TEvent): Promise<void>;
}
