import { assertEquals, assertThrows } from '@std/assert';
import { InvalidSuggestionTitleException, SuggestionTitle } from '@/Domain/Ticketing/Suggestions/mod.ts';

Deno.test('[Unit] - SuggestionTitle - create - valid input - trims and returns value object', () => {
    // Arrange
    const rawTitle = '  Improve seat selection UX  ';

    // Act
    const title = SuggestionTitle.create(rawTitle);

    // Assert
    assertEquals(title.value, 'Improve seat selection UX');
});

Deno.test('[Unit] - SuggestionTitle - create - too short - throws InvalidSuggestionTitleException', () => {
    // Arrange
    const invalidTitle = 'ab';

    // Act & Assert
    assertThrows(
        () => SuggestionTitle.create(invalidTitle),
        InvalidSuggestionTitleException,
    );
});

Deno.test('[Unit] - SuggestionTitle - create - too long - throws InvalidSuggestionTitleException', () => {
    // Arrange
    const invalidTitle = 'a'.repeat(121);

    // Act & Assert
    assertThrows(
        () => SuggestionTitle.create(invalidTitle),
        InvalidSuggestionTitleException,
    );
});

Deno.test('[Unit] - SuggestionTitle - equals - same value - returns true', () => {
    // Arrange
    const left = SuggestionTitle.create('Feature request');
    const right = SuggestionTitle.create('  Feature request  ');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - SuggestionTitle - equals - different value - returns false', () => {
    // Arrange
    const left = SuggestionTitle.create('Feature request');
    const right = SuggestionTitle.create('Bug report');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - SuggestionTitle - toString - valid value object - returns value', () => {
    // Arrange
    const title = SuggestionTitle.create('Feature request');

    // Act
    const result = title.toString();

    // Assert
    assertEquals(result, 'Feature request');
});
