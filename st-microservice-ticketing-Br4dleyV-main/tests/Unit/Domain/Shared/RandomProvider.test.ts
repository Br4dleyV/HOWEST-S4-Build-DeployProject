import { assertEquals, assert } from '@std/assert';
import { MathRandomProvider } from '@/Domain/Shared/mod.ts';

// ── MathRandomProvider Implementation ───────────────────────────────────────

Deno.test('MathRandomProvider - random - returns number between 0 and 1', () => {
    // Arrange
    const provider = new MathRandomProvider();

    // Act
    const result = provider.random();

    // Assert
    assert(result >= 0, 'Random value should be >= 0');
    assert(result < 1, 'Random value should be < 1');
});

Deno.test('MathRandomProvider - random - multiple calls - returns different values', () => {
    // Arrange
    const provider = new MathRandomProvider();

    // Act
    const result1 = provider.random();
    const result2 = provider.random();
    const result3 = provider.random();

    // Assert
    // Statistically unlikely all three are exactly the same
    assert(
        result1 !== result2 || result2 !== result3,
        'At least some random values should differ',
    );
});

Deno.test('MathRandomProvider - randomInt - max 10 - returns integer between 0 and 9', () => {
    // Arrange
    const provider = new MathRandomProvider();
    const max = 10;

    // Act
    const result = provider.randomInt(max);

    // Assert
    assert(Number.isInteger(result), 'Result should be an integer');
    assert(result >= 0, 'Random int should be >= 0');
    assert(result < max, `Random int should be < ${max}`);
});

Deno.test('MathRandomProvider - randomInt - max 100 - returns integer in range', () => {
    // Arrange
    const provider = new MathRandomProvider();
    const max = 100;

    // Act
    const result = provider.randomInt(max);

    // Assert
    assert(Number.isInteger(result), 'Result should be an integer');
    assert(result >= 0, 'Random int should be >= 0');
    assert(result < max, `Random int should be < ${max}`);
});

Deno.test('MathRandomProvider - randomInt - max 1 - always returns 0', () => {
    // Arrange
    const provider = new MathRandomProvider();

    // Act
    const result = provider.randomInt(1);

    // Assert
    assertEquals(result, 0);
});

Deno.test('MathRandomProvider - randomInt - multiple calls - distribution covers range', () => {
    // Arrange
    const provider = new MathRandomProvider();
    const max = 5;
    const results = new Set<number>();

    // Act - generate some random numbers
    for (let i = 0; i < 100; i++) {
        results.add(provider.randomInt(max));
    }

    // Assert - should have generated at least 2 different values
    assert(results.size >= 2, 'Should generate multiple different values');
    results.forEach((value) => {
        assert(value >= 0 && value < max, `Value ${value} should be in range [0, ${max})`);
    });
});
