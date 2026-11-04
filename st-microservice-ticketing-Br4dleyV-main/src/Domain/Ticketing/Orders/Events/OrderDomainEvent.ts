import { type DomainEvent, EventFQDN } from '@/Domain/Shared/mod.ts';

export abstract class OrderDomainEvent implements DomainEvent {
    protected static readonly FQDN_PREFIX = 'howestprime.ticketing.orders';

    abstract get FQDN(): EventFQDN;
    abstract get occurredOn(): Date;
}