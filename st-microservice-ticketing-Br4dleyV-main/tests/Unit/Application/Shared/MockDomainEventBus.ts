import type { DomainEvent } from '@/Domain/Shared/DomainEvents/DomainEvent.ts';
import type { DomainEventPublisher } from '@/Domain/Shared/DomainEvents/DomainEventPublisher.ts';

/**
 * Options for creating a mock DomainEventPublisher
 */
interface MockDomainEventBusOptions {
    /**
     * Whether the publish method should throw an error
     * Default: false
     */
    shouldThrowOnPublish?: boolean;

    /**
     * Whether the publishAll method should throw an error
     * Default: false
     */
    shouldThrowOnPublishAll?: boolean;

    /**
     * Custom error message when throwing
     * Default: 'Event bus error'
     */
    errorMessage?: string;
}

/**
 * Creates a mock DomainEventBus for testing event publishing without side effects
 *
 * @param options - Override options for customizing mock behavior
 * @returns Mock DomainEventBus with tracking properties
 *
 * @example
 * ```typescript
 * // Basic usage - verify events were published
 * const mockEventBus = createMockDomainEventBus();
 * await useCase.execute(input);
 * assertEquals(mockEventBus.publishAllCalled, true);
 * assertEquals(mockEventBus.publishedEvents.length, 1);
 * assertEquals(mockEventBus.publishedEvents[0].FQDN, 'TournamentCreated');
 *
 * // Verify specific event was published
 * const mockEventBus = createMockDomainEventBus();
 * await useCase.execute(input);
 * const tournamentCreatedEvent = mockEventBus.publishedEvents
 *     .find(e => e.FQDN === 'TournamentCreated');
 * assert(tournamentCreatedEvent !== undefined);
 *
 * // Simulate event bus error
 * const mockEventBus = createMockDomainEventBus({
 *     shouldThrowOnPublishAll: true,
 *     errorMessage: 'Event handler failed'
 * });
 * await assertRejects(
 *     () => useCase.execute(input),
 *     Error,
 *     'Event handler failed'
 * );
 * ```
 */
export function createMockDomainEventBus(
    options: MockDomainEventBusOptions = {},
): DomainEventPublisher & {
    publishCalled: boolean;
    publishCallCount: number;
    publishAllCalled: boolean;
    publishAllCallCount: number;
    publishedEvents: DomainEvent[];
    lastPublishedEvent: DomainEvent | null;
} {
    const mock = {
        // Tracking properties
        publishCalled: false,
        publishCallCount: 0,
        publishAllCalled: false,
        publishAllCallCount: 0,
        publishedEvents: [] as DomainEvent[],
        lastPublishedEvent: null as DomainEvent | null,

        // Mock implementation of publish (asynchronous to match interface)
        publish: async <TEvent extends DomainEvent>(event: TEvent): Promise<void> => {
            mock.publishCalled = true;
            mock.publishCallCount++;
            mock.lastPublishedEvent = event;
            mock.publishedEvents.push(event);

            if (options.shouldThrowOnPublish) {
                throw new Error(options.errorMessage || 'Event bus error');
            }
        },

        // Mock implementation of registerListener (required by interface)
        registerListener: () => {
            // No-op for mocking - tests don't need real listener registration
        },

        // Mock implementation of publishAll (not in interface but useful for tests)
        publishAll: async (events: DomainEvent[]): Promise<void> => {
            mock.publishAllCalled = true;
            mock.publishAllCallCount++;

            if (options.shouldThrowOnPublishAll) {
                throw new Error(options.errorMessage || 'Event bus error');
            }

            // Add all events to tracking
            for (const event of events) {
                mock.publishedEvents.push(event);
                mock.lastPublishedEvent = event;
            }
        },

        // Additional methods for test support (not part of real interface but useful)
        subscribe: () => {}, // No-op for mocking
        unsubscribe: () => {}, // No-op for mocking
        clear: () => {
            mock.publishedEvents = [];
            mock.lastPublishedEvent = null;
            mock.publishCalled = false;
            mock.publishCallCount = 0;
            mock.publishAllCalled = false;
            mock.publishAllCallCount = 0;
        },
        getHandlerCount: (_FQDN: string) => 0,
    };

    return mock as unknown as DomainEventPublisher & {
        publishCalled: boolean;
        publishCallCount: number;
        publishAllCalled: boolean;
        publishAllCallCount: number;
        publishedEvents: DomainEvent[];
        lastPublishedEvent: DomainEvent | null;
    };
}
