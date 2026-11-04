# Test Mocks

This directory contains reusable mock implementations for testing the MTG Tournaments microservice.

## Overview

Mocks are lightweight test doubles that simulate dependencies without implementing real business logic. They enable isolated unit testing by providing:

- **Type Safety**: Full TypeScript support with proper interfaces
- **Tracking Capabilities**: Properties to verify method calls and arguments
- **Flexible Overrides**: Customize behavior per test via options
- **Default Behaviors**: Sensible defaults that don't throw errors

## Available Mocks

### MockTournamentRepository

Mock implementation of `TournamentRepository` for testing use cases and domain services.

**Tracking Properties:**
- `saveCalled: boolean` - Whether save() was called
- `savedTournament: Tournament | null` - The tournament that was saved
- `removeCalled: boolean` - Whether remove() was called
- `removedTournament: Tournament | null` - The tournament that was removed

**Usage:**
```typescript
import { createMockTournamentRepository } from '@/tests/Shared/mod.ts';

// Basic usage with defaults
const mockRepo = createMockTournamentRepository();

// Custom behavior - tournament already exists
const existing = Tournament.create(
    TournamentName.create('Existing'),
    TournamentDate.create(new Date()),
    TournamentType.LimitedDraft,
);
const mockRepo = createMockTournamentRepository({
    byName: (name) => Promise.resolve(Optional.of(existing))
});

// Verify in test
await useCase.execute(input);
assertEquals(mockRepo.saveCalled, true);
assertEquals(mockRepo.savedTournament?.name, 'Expected Name');
```

### MockTournamentRunRepository

Mock implementation of `TournamentRunRepository` for testing use cases and domain services.

**Tracking Properties:**
- `saveCalled: boolean` - Whether save() was called
- `savedTournamentRun: TournamentRun | null` - The tournament run that was saved
- `removeCalled: boolean` - Whether remove() was called
- `removedTournamentRun: TournamentRun | null` - The tournament run that was removed

**Usage:**
```typescript
import { createMockTournamentRunRepository } from '@/tests/Shared/mod.ts';

const mockRepo = createMockTournamentRunRepository();

const existing = TournamentRun.create(TournamentId.create());
const mockRepo = createMockTournamentRunRepository({
    byTournamentId: (tournamentId) => Promise.resolve(Optional.of(existing))
});
```

### MockMatchRepository

Mock implementation of `MatchRepository` for testing match-related use cases.

**Tracking Properties:**
- `saveCalled: boolean` - Whether save() was called
- `saveCallCount: number` - How many times save() was called
- `savedMatch: Match | null` - The last match that was saved
- `savedMatches: Match[]` - All matches passed to save()
- `removeCalled: boolean` - Whether remove() was called
- `removedMatch: Match | null` - The match that was removed

**Usage:**
```typescript
import { createMockMatchRepository } from '@/tests/Shared/mod.ts';

const mockRepo = createMockMatchRepository();

const mockRepo = createMockMatchRepository({
    byId: (id) => Promise.resolve(Optional.of(existingMatch))
});
```

### MockUnitOfWork

Mock implementation of `UnitOfWork` for testing transaction boundaries and automatic event publishing.

**Tracking Properties:**
- `doCalled: boolean` - Whether do() was called
- `doCallCount: number` - How many times do() was called
- `trackedEntities: Entity[]` - Array of entities tracked for event publishing
- `eventBus: DomainEventBus` - The event bus used for publishing events

**Usage:**
```typescript
import { createMockUnitOfWork } from '@/tests/Shared/mod.ts';

// Basic usage
const mockUnitOfWork = createMockUnitOfWork();

// With custom event bus to verify events
const mockEventBus = createMockDomainEventBus();
const mockUnitOfWork = createMockUnitOfWork({ eventBus: mockEventBus });

// Simulate transaction error
const mockUnitOfWork = createMockUnitOfWork({
    shouldThrow: true,
    errorMessage: 'Database connection lost'
});

// Verify in test
await useCase.execute(input);
assertEquals(mockUnitOfWork.doCalled, true);
assertEquals(mockUnitOfWork.trackedEntities.length, 1);
assertEquals(mockUnitOfWork.eventBus.publishAllCalled, true);
```

### MockDomainEventBus

Mock implementation of `DomainEventBus` for testing event publishing without side effects.

**Tracking Properties:**
- `publishCalled: boolean` - Whether publish() was called
- `publishCallCount: number` - How many times publish() was called
- `publishAllCalled: boolean` - Whether publishAll() was called
- `publishAllCallCount: number` - How many times publishAll() was called
- `publishedEvents: DomainEvent[]` - Array of all published events
- `lastPublishedEvent: DomainEvent | null` - The last event that was published

**Usage:**
```typescript
import { createMockDomainEventBus } from '@/tests/Shared/mod.ts';

// Basic usage
const mockEventBus = createMockDomainEventBus();

// Verify in test
await useCase.execute(input);
assertEquals(mockEventBus.publishAllCalled, true);
assertEquals(mockEventBus.publishedEvents.length, 1);
assertEquals(mockEventBus.publishedEvents[0].FQDN, 'TournamentCreated');

// Find specific event
const tournamentCreated = mockEventBus.publishedEvents
    .find(e => e.FQDN === 'TournamentCreated');
assert(tournamentCreated !== undefined);
```

## Best Practices

### ✅ DO:

1. **Create fresh mocks for each test**
   ```typescript
   Deno.test('test case', async () => {
       const mockRepo = createMockTournamentRepository(); // Fresh instance
       // ... test logic
   });
   ```

2. **Use override options for test-specific behavior**
   ```typescript
   const mockRepo = createMockTournamentRepository({
       byName: () => Promise.resolve(Optional.of(existingTournament))
   });
   ```

3. **Verify tracking properties in assertions**
   ```typescript
   assertEquals(mockRepo.saveCalled, true);
   assertEquals(mockRepo.savedTournament?.name, 'Expected');
   ```

4. **Test error conditions with overrides**
   ```typescript
   const mockRepo = createMockTournamentRepository({
       save: () => Promise.reject(new Error('DB error'))
   });
   ```

### ❌ DON'T:

1. **Don't reuse mock instances across tests**
   ```typescript
   // ❌ BAD
   const mockRepo = createMockTournamentRepository();
   Deno.test('test 1', async () => { /* uses mockRepo */ });
   Deno.test('test 2', async () => { /* uses mockRepo - WRONG! */ });
   ```

2. **Don't add business logic to mocks**
   ```typescript
   // ❌ BAD
   const mockRepo = createMockTournamentRepository({
       save: (tournament) => {
           if (tournament.name.length > 100) { // Business logic!
               throw new Error('Name too long');
           }
       }
   });
   ```

3. **Don't mock the system under test**
   ```typescript
   // ❌ BAD - mocking the use case you're testing
   const mockUseCase = createMockCreateTournament(); // Wrong!
   ```

## Testing Patterns

### Pattern 1: Happy Path
```typescript
Deno.test('CreateTournament - valid input - creates successfully', async () => {
    // Arrange
    const mockRepo = createMockTournamentRepository();
    const mockUnitOfWork = createMockUnitOfWork();
    const useCase = new CreateTournament(mockRepo, mockUnitOfWork);

    // Act
    const output = await useCase.execute({
        name: 'Test Tournament',
        date: new Date('2025-12-01'),
        type: TournamentType.Standard
    });

    // Assert
    assertEquals(typeof output.tournamentId, 'string');
    assertEquals(mockRepo.saveCalled, true);
    assertEquals(mockUnitOfWork.doCalled, true);
    assertEquals(mockUnitOfWork.trackedEntities.length, 1);
    assertEquals(mockUnitOfWork.eventBus.publishAllCalled, true);
});
```

### Pattern 2: Business Rule Validation
```typescript
Deno.test('CreateTournament - duplicate name - throws exception', async () => {
    // Arrange
    const existing = Tournament.create(
        TournamentName.create('Duplicate'),
        TournamentDate.create(new Date()),
        TournamentType.LimitedDraft,
    );
    const mockRepo = createMockTournamentRepository({
        byName: () => Promise.resolve(Optional.of(existing))
    });
    const mockUnitOfWork = createMockUnitOfWork();
    const useCase = new CreateTournament(mockRepo, mockUnitOfWork);

    // Act & Assert
    await assertRejects(
        () => useCase.execute({
            name: 'Duplicate',
            date: new Date(),
            type: TournamentType.Standard
        }),
        Error,
        'Tournament with name "Duplicate" already exists'
    );
});
```

### Pattern 3: Error Handling
```typescript
Deno.test('CreateTournament - repository error - propagates error', async () => {
    // Arrange
    const mockRepo = createMockTournamentRepository({
        save: () => Promise.reject(new Error('Database error'))
    });
    const mockUnitOfWork = createMockUnitOfWork();
    const useCase = new CreateTournament(mockRepo, mockUnitOfWork);

    // Act & Assert
    await assertRejects(
        () => useCase.execute({
            name: 'Test',
            date: new Date(),
            type: TournamentType.Standard
        }),
        Error,
        'Database error'
    );
});
```

### Pattern 4: Event Verification
```typescript
Deno.test('CreateTournament - success - publishes TournamentCreated event', async () => {
    // Arrange
    const mockRepo = createMockTournamentRepository();
    const mockUnitOfWork = createMockUnitOfWork();
    const useCase = new CreateTournament(mockRepo, mockUnitOfWork);

    // Act
    await useCase.execute({
        name: 'Test',
        date: new Date('2025-12-01'),
        type: TournamentType.Standard
    });

    // Assert - Events automatically published by UnitOfWork
    assertEquals(mockUnitOfWork.eventBus.publishedEvents.length, 1);
    const event = mockUnitOfWork.eventBus.publishedEvents[0];
    assertEquals(event.FQDN, 'TournamentCreated');
});
```

## Maintenance

### Adding New Methods

When a new method is added to an interface:

1. Update the mock options interface
2. Add the method to the mock implementation
3. Provide a sensible default
4. Update this README with examples
5. Add tracking properties if needed

**Example:**
```typescript
// New method added to TournamentRepository
interface TournamentRepository {
    byType(type: TournamentType): Promise<Tournament[]>;
}

// Update MockTournamentRepositoryOptions
interface MockTournamentRepositoryOptions {
    byType?: (type: TournamentType) => Promise<Tournament[]>;
}

// Add to mock implementation
byType: options.byType || ((_type: TournamentType): Promise<Tournament[]> =>
    Promise.resolve([])
),
```

### Version History

- **v1.0.0** (2025-10-19): Initial mocks for CreateTournament use case
  - MockTournamentRepository
  - MockUnitOfWork
  - MockDomainEventBus

## Related Documentation

- **Prompt**: `/prompts/tests/mocks.md` - Guide for creating new mocks
- **Domain Tests**: `/prompts/tests/domain_tests.md` - Testing domain entities
- **Use Cases**: `/prompts/application/use_cases.md` - Creating use cases

## Support

For questions or issues with mocks:
1. Check the prompt documentation: `/prompts/tests/mocks.md`
2. Review existing test files for examples
3. Ensure TypeScript types match the interface exactly
