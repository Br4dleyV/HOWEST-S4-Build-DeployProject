import { assertEquals, assertThrows } from '@std/assert';
import { UUIDEntityId } from '@/Domain/Shared/mod.ts';

// ── Test UUIDEntityId Implementation ────────────────────────────────────────

class TestUUIDEntityId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): TestUUIDEntityId {
        return new TestUUIDEntityId(value);
    }
}

// ── Value Object Creation ───────────────────────────────────────────────────

Deno.test('UUIDEntityId - create - valid UUID - success', () => {
    // Arrange
    const uuid = crypto.randomUUID();

    // Act
    const id = TestUUIDEntityId.create(uuid);

    // Assert
    assertEquals(id.value, uuid);
});

Deno.test('UUIDEntityId - create - no value provided - generates new UUID', () => {
    // Act
    const id = TestUUIDEntityId.create();

    // Assert
    assertEquals(typeof id.value, 'string');
    assertEquals(id.value.length, 36); // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    assertEquals(id.value.split('-').length, 5);
});

Deno.test('UUIDEntityId - create - invalid UUID format - throws error', () => {
    // Arrange
    const invalidUUID = 'not-a-uuid';

    // Act & Assert
    assertThrows(() => {
        TestUUIDEntityId.create(invalidUUID);
    });
});

Deno.test('UUIDEntityId - create - version 7 UUID - success', () => {
    const uuid = '019e4bc3-0fb5-7249-82cc-3784ce81dad7';

    const id = TestUUIDEntityId.create(uuid);

    assertEquals(id.value, uuid);
});

Deno.test('UUIDEntityId - create - empty string - throws error', () => {
    // Act & Assert
    assertThrows(() => {
        TestUUIDEntityId.create('');
    });
});

Deno.test('UUIDEntityId - create - malformed UUID - throws error', () => {
    // Arrange
    const malformedUUID = '12345678-1234-1234-1234-12345678901'; // Too short

    // Act & Assert
    assertThrows(() => {
        TestUUIDEntityId.create(malformedUUID);
    });
});

// ── Getters ─────────────────────────────────────────────────────────────────

Deno.test('UUIDEntityId - value - returns correct UUID value', () => {
    // Arrange
    const uuid = crypto.randomUUID();
    const id = TestUUIDEntityId.create(uuid);

    // Act
    const value = id.value;

    // Assert
    assertEquals(value, uuid);
});

Deno.test('UUIDEntityId - toString - returns UUID string', () => {
    // Arrange
    const uuid = crypto.randomUUID();
    const id = TestUUIDEntityId.create(uuid);

    // Act
    const str = id.toString();

    // Assert
    assertEquals(str, uuid);
});

// ── Equality ────────────────────────────────────────────────────────────────

Deno.test('UUIDEntityId - equals - same UUID - returns true', () => {
    // Arrange
    const uuid = crypto.randomUUID();
    const id1 = TestUUIDEntityId.create(uuid);
    const id2 = TestUUIDEntityId.create(uuid);

    // Act & Assert
    assertEquals(id1.equals(id2), true);
});

Deno.test('UUIDEntityId - equals - different UUID - returns false', () => {
    // Arrange
    const id1 = TestUUIDEntityId.create(crypto.randomUUID());
    const id2 = TestUUIDEntityId.create(crypto.randomUUID());

    // Act & Assert
    assertEquals(id1.equals(id2), false);
});

Deno.test('UUIDEntityId - equals - same instance - returns true', () => {
    // Arrange
    const id = TestUUIDEntityId.create(crypto.randomUUID());

    // Act & Assert
    assertEquals(id.equals(id), true);
});

Deno.test('UUIDEntityId - equals - different types - returns false', () => {
    // Arrange & Act
    class OtherUUIDEntityId extends UUIDEntityId {
        private constructor(id?: string) {
            super(id);
        }

        static create(value?: string): OtherUUIDEntityId {
            return new OtherUUIDEntityId(value);
        }
    }

    const uuid = crypto.randomUUID();
    const id1 = TestUUIDEntityId.create(uuid);
    const id2 = OtherUUIDEntityId.create(uuid);

    // Assert
    assertEquals(id1.equals(id2 as unknown as TestUUIDEntityId), false);
});
