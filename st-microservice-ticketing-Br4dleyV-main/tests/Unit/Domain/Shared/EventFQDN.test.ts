import { assertEquals, assertThrows } from '@std/assert';
import { EventFQDN } from '@/Domain/Shared/mod.ts';

// ── Value Object Creation ───────────────────────────────────────────────────

Deno.test('EventFQDN - create - valid two-part FQDN - success', () => {
    // Arrange & Act
    const fqdn = EventFQDN.create('howestprime.ticketing');

    // Assert
    assertEquals(fqdn.value, 'howestprime.ticketing');
});

Deno.test('EventFQDN - create - valid three-part FQDN - success', () => {
    // Arrange & Act
    const fqdn = EventFQDN.create('howestprime.ticketing.movies');

    // Assert
    assertEquals(fqdn.value, 'howestprime.ticketing.movies');
});

Deno.test('EventFQDN - create - valid multi-part FQDN - success', () => {
    // Arrange & Act
    const fqdn = EventFQDN.create('howestprime.ticketing.orders.created');

    // Assert
    assertEquals(fqdn.value, 'howestprime.ticketing.orders.created');
});

Deno.test('EventFQDN - create - empty string - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('');
        },
        Error,
        'Event FQDN cannot be empty',
    );
});

Deno.test('EventFQDN - create - whitespace only - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('   ');
        },
        Error,
        'Event FQDN cannot be empty',
    );
});

Deno.test('EventFQDN - create - single part without dots - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('howestprime');
        },
        Error,
        'Event FQDN must contain at least namespace and event name',
    );
});

Deno.test('EventFQDN - create - empty part between dots - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('howestprime..ticketing');
        },
        Error,
        'Event FQDN parts cannot be empty',
    );
});

Deno.test('EventFQDN - create - empty part at start - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('.ticketing.movies');
        },
        Error,
        'Event FQDN parts cannot be empty',
    );
});

Deno.test('EventFQDN - create - empty part at end - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('howestprime.ticketing.');
        },
        Error,
        'Event FQDN parts cannot be empty',
    );
});

Deno.test('EventFQDN - create - whitespace part - throws error', () => {
    // Act & Assert
    assertThrows(
        () => {
            EventFQDN.create('howestprime.   .ticketing');
        },
        Error,
        'Event FQDN parts cannot be empty',
    );
});

// ── Getters ─────────────────────────────────────────────────────────────────

Deno.test('EventFQDN - value - returns correct value', () => {
    // Arrange
    const fqdn = EventFQDN.create('howestprime.ticketing.movies.registered');

    // Act
    const value = fqdn.value;

    // Assert
    assertEquals(value, 'howestprime.ticketing.movies.registered');
});

Deno.test('EventFQDN - toString - returns correct string representation', () => {
    // Arrange
    const fqdn = EventFQDN.create('howestprime.ticketing.payment.succeeded');

    // Act
    const str = fqdn.toString();

    // Assert
    assertEquals(str, 'howestprime.ticketing.payment.succeeded');
});

// ── Equality ────────────────────────────────────────────────────────────────

Deno.test('EventFQDN - equals - same value - returns true', () => {
    // Arrange
    const fqdn1 = EventFQDN.create('howestprime.ticketing.movies.registered');
    const fqdn2 = EventFQDN.create('howestprime.ticketing.movies.registered');

    // Act & Assert
    assertEquals(fqdn1.equals(fqdn2), true);
});

Deno.test('EventFQDN - equals - different value - returns false', () => {
    // Arrange
    const fqdn1 = EventFQDN.create('howestprime.ticketing.movies.registered');
    const fqdn2 = EventFQDN.create('howestprime.ticketing.orders.created');

    // Act & Assert
    assertEquals(fqdn1.equals(fqdn2), false);
});

Deno.test('EventFQDN - equals - case sensitive - returns false', () => {
    // Arrange
    const fqdn1 = EventFQDN.create('howestprime.ticketing.movies');
    const fqdn2 = EventFQDN.create('Howestprime.Ticketing.Movies');

    // Act & Assert
    assertEquals(fqdn1.equals(fqdn2), false);
});
