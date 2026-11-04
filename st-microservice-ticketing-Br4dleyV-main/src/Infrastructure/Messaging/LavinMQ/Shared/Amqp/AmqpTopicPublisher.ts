import type { AmqpBroker } from './AmqpBroker.ts';
import type { DomainEvent, DomainEventListener } from '@/Domain/Shared/mod.ts';

export class AmqpTopicPublisher implements DomainEventListener {
    private static readonly ASYNCAPI_HANDLER = '__asyncapi__';
    private readonly _amqpBroker: AmqpBroker;
    private readonly _exchange: string;
    private readonly _subscriptions: Map<string, Set<string>>;

    public static create(
        messageBroker: AmqpBroker,
        exchange: string,
        _allowedTopics: string[] = [],
    ): AmqpTopicPublisher {
        console.log('Registering allowed topics:\n' + _allowedTopics.join(', '));
        return new AmqpTopicPublisher(messageBroker, exchange, _allowedTopics);
    }

    private constructor(
        messageBroker: AmqpBroker,
        exchange: string,
        allowedTopics: string[],
    ) {
        this._amqpBroker = messageBroker;
        this._exchange = exchange;
        this._subscriptions = new Map<string, Set<string>>();
        for (const topic of allowedTopics) {
            this.subscribe(topic, AmqpTopicPublisher.ASYNCAPI_HANDLER);
        }
    }

    subscribe(FQDN: string, handler: string): void {
        const handlers = this._subscriptions.get(FQDN) ?? new Set<string>();
        handlers.add(handler);
        this._subscriptions.set(FQDN, handlers);
    }

    unsubscribe(FQDN: string, handler: string): void {
        const handlers = this._subscriptions.get(FQDN);
        if (!handlers) {
            return;
        }

        handlers.delete(handler);
        if (handlers.size === 0) {
            this._subscriptions.delete(FQDN);
        }
    }

    listen<Event extends DomainEvent>(event: Event): void {
        const routingKey = this.getRoutingKey(event);
        if (!this._subscriptions.has(routingKey)) {
            return;
        }

        this._amqpBroker.publishOnTopic(
            this._exchange,
            routingKey,
            this.serializeEvent(event),
        ).then(() => {
            console.log(`Published domain event: ${routingKey} to ${this._exchange}`);
        }).catch((error) => {
            console.error(
                `Failed publishing domain event '${routingKey}' to ${this._exchange}`,
                error,
            );
        });
    }

    private serializeEvent(event: DomainEvent): string {
        const message = {
            eventId: crypto.randomUUID(),
            eventType: event.constructor.name,
            eventVersion: 1,
            occurredAt: event.occurredOn.toISOString(),
            payload: this.extractPayload(event),
        };

        return JSON.stringify(message.payload);
    }

    private extractPayload(event: DomainEvent): Record<string, unknown> {
        const payload: Record<string, unknown> = {};
        const eventRecord = event as unknown as Record<string, unknown>;

        for (const [key, value] of Object.entries(eventRecord)) {
            if (!key.startsWith('_')) {
                continue;
            }

            if (key === '_occurredOn') {
                continue;
            }

            payload[this.normalizeKey(key)] = this.serializeValue(value);
        }

        return payload;
    }

    private serializeValue(value: unknown): unknown {
        if (value instanceof Date) {
            return value.toISOString();
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.serializeValue(item));
        }

        if (value && typeof value === 'object') {
            const serializedObject: Record<string, unknown> = {};
            for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
                serializedObject[this.normalizeKey(key)] = this.serializeValue(nestedValue);
            }
            return serializedObject;
        }

        return value;
    }

    private normalizeKey(key: string): string {
        if (!key.startsWith('_')) {
            return key;
        }

        return key.slice(1);
    }

    private getRoutingKey(event: DomainEvent): string {
        return event.FQDN.value;
    }
}
