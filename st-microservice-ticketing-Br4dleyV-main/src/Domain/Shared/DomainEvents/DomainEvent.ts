import type { EventFQDN } from './EventFQDN.ts';

export interface DomainEvent {
    get FQDN(): EventFQDN;
    get occurredOn(): Date;
}
