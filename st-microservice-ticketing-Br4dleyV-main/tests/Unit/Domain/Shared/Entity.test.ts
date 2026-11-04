import { assertEquals } from '@std/assert';
import { Entity, UUIDEntityId } from '@/Domain/Shared/mod.ts';

// ── Test Entity Implementation ──────────────────────────────────────────────

class TestEntityId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): TestEntityId {
        return new TestEntityId(value);
    }
}

class TestEntity extends Entity<TestEntityId> {
    private readonly _name: string;

    constructor(id: TestEntityId, name: string) {
        super(id);
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
}

// ── Entity Creation ─────────────────────────────────────────────────────────

Deno.test('Entity - constructor - valid id - creates entity', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const name = 'Test Entity';

    // Act
    const entity = new TestEntity(id, name);

    // Assert
    assertEquals(entity.id.value, id.value);
    assertEquals(entity.name, name);
});

Deno.test('Entity - id - returns correct entity id', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const entity = new TestEntity(id, 'Test');

    // Act
    const retrievedId = entity.id;

    // Assert
    assertEquals(retrievedId, id);
    assertEquals(retrievedId.value, id.value);
});

// ── Equality ────────────────────────────────────────────────────────────────

Deno.test('Entity - equals - same id - returns true', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const entity1 = new TestEntity(id, 'Entity 1');
    const entity2 = new TestEntity(id, 'Entity 2');

    // Act & Assert
    assertEquals(entity1.equals(entity2), true);
});

Deno.test('Entity - equals - different id - returns false', () => {
    // Arrange
    const id1 = TestEntityId.create(crypto.randomUUID());
    const id2 = TestEntityId.create(crypto.randomUUID());
    const entity1 = new TestEntity(id1, 'Entity 1');
    const entity2 = new TestEntity(id2, 'Entity 2');

    // Act & Assert
    assertEquals(entity1.equals(entity2), false);
});

Deno.test('Entity - equals - null entity - returns false', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const entity = new TestEntity(id, 'Test');

    // Act & Assert
    assertEquals(entity.equals(null as unknown as TestEntity), false);
});

Deno.test('Entity - equals - undefined entity - returns false', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const entity = new TestEntity(id, 'Test');

    // Act & Assert
    assertEquals(entity.equals(undefined as unknown as TestEntity), false);
});

Deno.test('Entity - equals - same instance - returns true', () => {
    // Arrange
    const id = TestEntityId.create(crypto.randomUUID());
    const entity = new TestEntity(id, 'Test');

    // Act & Assert
    assertEquals(entity.equals(entity), true);
});
