import { type DomainEvent, EventFQDN } from '../../../Shared/mod.ts';

/**
 * Base class for movie-related domain events.
 * Provides a shared namespace for event names.
 */
export abstract class MovieDomainEvent implements DomainEvent {
    protected static readonly FQDN_PREFIX = 'howestprime.ticketing.movies';

    abstract get FQDN(): EventFQDN;
    abstract get occurredOn(): Date;
}
