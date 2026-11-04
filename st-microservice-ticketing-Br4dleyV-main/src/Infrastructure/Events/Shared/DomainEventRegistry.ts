import { DomainEventListener } from '../../../Domain/Shared/mod.ts';

export class DomainEventRegistry {
    private readonly _eventListeners: DomainEventListener[];
    private readonly _handlerMap: Map<string, string[]>;

    constructor(eventListeners: DomainEventListener[]) {
        this._handlerMap = new Map<string, string[]>();
        this._eventListeners = eventListeners;
    }

    register(
        FQDN: string,
        handlerName: string,
    ): void {
        console.log(`📋 Registering handler '${handlerName}' for event: ${FQDN}`);
        if (!this._handlerMap.has(FQDN)) {
            this._handlerMap.set(FQDN, []);
        }

        const handlers = this._handlerMap.get(FQDN)!;
        handlers.push(handlerName);

        console.log(`📋 Registered handler for event: ${FQDN} (total: ${handlers.length})`);
    }

    registerFromMapping(
        handlerMapping: Map<string, string[]>,
    ): void {
        console.log(
            '📋 Registering handlers from mapping...',
            handlerMapping,
            Object.entries(handlerMapping),
        );

        for (const [FQDN, handlerNames] of handlerMapping.entries()) {
            console.log(` Registering handlers for event: ${FQDN}`);
            for (const handlerName of handlerNames) {
                console.log(`Registering handler name: ${handlerName}`);
                this.register(FQDN, handlerName);
            }
        }

        console.log('✅ All handlers registered from mapping');
    }

    async subscribeAll(): Promise<void> {
        console.log(
            '🚀 Subscribing all handlers to event bus...',
            this._handlerMap.entries().toArray().length,
        );
        for (const [FQDN, handlerNames] of this._handlerMap.entries()) {
            console.log(`Subscribing handlers for event: ${FQDN}`);
            for (const handlerName of handlerNames) {
                console.log(` Subscribing handler: ${handlerName}`);
                for (const eventListener of this._eventListeners) {
                    console.log(`  Using event listener: ${eventListener.constructor.name}`);
                    eventListener.subscribe(FQDN, handlerName);
                }
            }
            console.log(`✅ Subscribed ${handlerNames.length} handler(ies) to ${FQDN}`);
        }

        console.log(`🚀 All handlers subscribed (${this.getTotalHandlerCount()} total)`);
        await Promise.resolve();
    }

    getTotalHandlerCount() {
        let count = 0;
        for (const handlers of this._handlerMap.values()) {
            count += handlers.length;
        }
        return count;
    }

    unsubscribeAll(): void {
        for (const [FQDN, handlers] of this._handlerMap.entries()) {
            for (const handler of handlers) {
                for (const eventListener of this._eventListeners) {
                    eventListener.unsubscribe(FQDN, handler);
                }
            }
        }

        console.log('🔌 All handlers unsubscribed from event bus');
    }
}
