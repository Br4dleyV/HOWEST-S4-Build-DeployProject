import { DomainEvent, DomainEventListener } from '@/Domain/Shared/mod.ts';
import type { ServiceProvider } from '@domaincrafters/di';
import { Policy } from '@/Application/Ports/mod.ts';

export class PolicyDomainEventListener implements DomainEventListener {
    private readonly _policies: Map<string, string[]> = new Map();
    private readonly _serviceProvider: ServiceProvider;
    private readonly _policyTimeoutMs: number;

    constructor(serviceProvider: ServiceProvider, policyTimeoutMs: number = 5000) {
        this._serviceProvider = serviceProvider;
        this._policyTimeoutMs = policyTimeoutMs;
    }

    subscribe(FQDN: string, policy: string): void {
        console.log(`Subscribing policy '${policy}' to event '${FQDN}'`);
        console.log(this._policies);

        const existingPolicies = this._policies.get(FQDN) || [];
        /*if (existingPolicies.includes(policy)) {
            return;
        }
        */
        existingPolicies.push(policy);
        this._policies.set(FQDN, existingPolicies);
    }

    unsubscribe(FQDN: string, policy: string): void {
        const existingPolicies = this._policies.get(FQDN);
        if (!existingPolicies) {
            return;
        }

        const index = existingPolicies.indexOf(policy);
        if (index > -1) {
            existingPolicies.splice(index, 1);
            this._policies.set(FQDN, existingPolicies);
        }
    }

    listen<Event extends DomainEvent>(event: Event): void {
        console.log(`PolicyDomainEventListener received event: ${event.FQDN.value}`);
        console.log(this._policies);
        const policyNames = this._policies.get(event.FQDN.value);
        console.log(`Policies to execute: ${policyNames?.join(', ') || 'None'}`);
        if (!policyNames || policyNames.length === 0) {
            return;
        }

        // Fire-and-forget: execute all handlers asynchronously without blocking
        // Each policy gets its own DI scope (fresh UnitOfWork, etc.)
        Promise.all(
            policyNames.map((policyName) => this.executePolicySafely(policyName, event)),
        ).catch((error) => {
            // This should never happen since executePolicySafely catches all errors
            console.error('Unexpected error in event publishing:', error);
        });

        // Return immediately without waiting for handlers to complete
    }

    private async executePolicySafely<TEvent extends DomainEvent>(
        policyName: string,
        event: TEvent,
    ): Promise<void> {
        let scope: ServiceProvider | undefined;

        console.log(`Executing policy '${policyName}' for event ${event.FQDN.value}`);

        try {
            scope = this._serviceProvider.createScope();

            const policy = (await scope.getService<Policy<DomainEvent>>(policyName)).getOrThrow(
                `Failed to resolve policy '${policyName}'`,
            );

            // Use AbortSignal for timeout - cleaner and no timer leaks
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), this._policyTimeoutMs);

            try {
                // Execute policy with abort signal support
                await Promise.race([
                    policy.handle(event),
                    new Promise<never>((_, reject) => {
                        abortController.signal.addEventListener('abort', () => {
                            reject(new Error(`Policy timeout after ${this._policyTimeoutMs}ms`));
                        }, { once: true });
                    }),
                ]);
            } finally {
                // Always clear the timeout immediately when done
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error(
                `Policy policy '${policyName}' failed for event ${event.FQDN.value}:`,
                error instanceof Error ? error.message : String(error),
            );
        } finally {
            if (scope && typeof scope.dispose === 'function') {
                await scope.dispose();
            }
        }
    }
}
