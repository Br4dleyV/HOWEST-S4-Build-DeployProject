import { type DomainEvent, EventFQDN } from '@/Domain/Shared/mod.ts';

export abstract class PaymentDomainEvent implements DomainEvent {
    protected static readonly FQDN_PREFIX = 'howestprime.ticketing.payment';

    abstract get FQDN(): EventFQDN;
    abstract get occurredOn(): Date;
}