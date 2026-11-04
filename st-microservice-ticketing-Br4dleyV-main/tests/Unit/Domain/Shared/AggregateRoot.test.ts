import { assertEquals, assertExists } from '@std/assert';
import {
    AggregateRoot,
    type DomainEvent,
    EventFQDN,
    UUIDEntityId,
} from '@/Domain/Shared/mod.ts';

// ── Test Aggregate Implementation ───────────────────────────────────────────

class TestAggregateId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): TestAggregateId {
        return new TestAggregateId(value);
    }
}

class TestDomainEvent implements DomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create('test.event.created');
    private readonly _occurredOn: Date;
    private readonly _data: string;

    constructor(data: string) {
        this._occurredOn = new Date();
        this._data = data;
    }

    get FQDN(): EventFQDN {
        return TestDomainEvent.FQDN_VALUE;
    }

    get occurredOn(): Date {
        return this._occurredOn;
    }

    get data(): string {
        return this._data;
    }
}

class TestAggregate extends AggregateRoot<TestAggregateId> {
    private constructor(id: TestAggregateId) {
        super(id);
    }

    static create(id?: string): TestAggregate {
        const aggregateId = TestAggregateId.create(id);
        const aggregate = new TestAggregate(aggregateId);
        aggregate.raise(new TestDomainEvent('Aggregate created'));
        return aggregate;
    }

    doSomething(data: string): void {
        this.raise(new TestDomainEvent(data));
    }
}

// ── Aggregate Creation ──────────────────────────────────────────────────────

Deno.test('AggregateRoot - create - valid id - returns aggregate instance', () => {
    // Arrange
    const id = crypto.randomUUID();

    // Act
    const aggregate = TestAggregate.create(id);

    // Assert
    assertExists(aggregate);
    assertEquals(aggregate.id.value, id);
});

Deno.test('AggregateRoot - create - no id provided - generates new id', () => {
    // Act
    const aggregate = TestAggregate.create();

    // Assert
    assertExists(aggregate);
    assertExists(aggregate.id);
    assertExists(aggregate.id.value);
});

// ── Domain Event Management ─────────────────────────────────────────────────

Deno.test('AggregateRoot - raise - single event - adds event to collection', () => {
    // Arrange
    const aggregate = TestAggregate.create();

    // Act
    aggregate.doSomething('test data');

    // Assert
    assertEquals(aggregate.hasDomainEvents(), true);
    assertEquals(aggregate.domainEvents.length, 2); // created + doSomething
});

Deno.test('AggregateRoot - pullDomainEvents - returns all events and clears', () => {
    // Arrange
    const aggregate = TestAggregate.create();
    aggregate.doSomething('test data 1');
    aggregate.doSomething('test data 2');

    // Act
    const events = aggregate.pullDomainEvents();

    // Assert
    assertEquals(events.length, 3); // created + 2 actions
    assertEquals(aggregate.hasDomainEvents(), false);
    assertEquals(aggregate.domainEvents.length, 0);
});

Deno.test('AggregateRoot - pullDomainEvents - subsequent call - returns empty array', () => {
    // Arrange
    const aggregate = TestAggregate.create();
    aggregate.pullDomainEvents(); // First pull

    // Act
    const events = aggregate.pullDomainEvents(); // Second pull

    // Assert
    assertEquals(events.length, 0);
    assertEquals(aggregate.hasDomainEvents(), false);
});

Deno.test('AggregateRoot - domainEvents - returns readonly view without clearing', () => {
    // Arrange
    const aggregate = TestAggregate.create();
    aggregate.doSomething('test data');

    // Act
    const events1 = aggregate.domainEvents;
    const events2 = aggregate.domainEvents;

    // Assert
    assertEquals(events1.length, 2);
    assertEquals(events2.length, 2);
    assertEquals(aggregate.hasDomainEvents(), true); // Still has events
});

Deno.test('AggregateRoot - hasDomainEvents - no events - returns false', () => {
    // Arrange
    const aggregate = TestAggregate.create();
    aggregate.pullDomainEvents(); // Clear events

    // Act & Assert
    assertEquals(aggregate.hasDomainEvents(), false);
});

Deno.test('AggregateRoot - hasDomainEvents - with events - returns true', () => {
    // Arrange
    const aggregate = TestAggregate.create();

    // Act & Assert
    assertEquals(aggregate.hasDomainEvents(), true);
});

Deno.test('AggregateRoot - raise - multiple events - maintains order', () => {
    // Arrange
    const aggregate = TestAggregate.create();

    // Act
    aggregate.doSomething('first');
    aggregate.doSomething('second');
    aggregate.doSomething('third');

    const events = aggregate.pullDomainEvents();

    // Assert
    assertEquals(events.length, 4); // created + 3 actions
    assertEquals((events[1] as TestDomainEvent).data, 'first');
    assertEquals((events[2] as TestDomainEvent).data, 'second');
    assertEquals((events[3] as TestDomainEvent).data, 'third');
});
