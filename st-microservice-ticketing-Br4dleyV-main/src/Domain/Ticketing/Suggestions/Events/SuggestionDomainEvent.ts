import { type DomainEvent, EventFQDN } from '@/Domain/Shared/mod.ts';

export abstract class SuggestionDomainEvent implements DomainEvent {
    protected static readonly FQDN_PREFIX = 'howestprime.ticketing.suggestions';

    abstract get FQDN(): EventFQDN;
    abstract get occurredOn(): Date;
}
