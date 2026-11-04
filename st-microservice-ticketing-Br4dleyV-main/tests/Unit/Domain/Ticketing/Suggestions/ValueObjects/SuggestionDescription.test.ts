import { assertEquals, assertThrows } from '@std/assert';
import { InvalidSuggestionDescriptionException, SuggestionDescription } from '@/Domain/Ticketing/Suggestions/mod.ts';

Deno.test('[Unit] - SuggestionDescription - create - valid input - trims and returns value object', () => {
    // Arrange
    const rawDescription = '   Add keyboard shortcuts for booking flow.   ';

    // Act
    const description = SuggestionDescription.create(rawDescription);

    // Assert
    assertEquals(description.value, 'Add keyboard shortcuts for booking flow.');
});

Deno.test(
    '[Unit] - SuggestionDescription - create - too short - throws InvalidSuggestionDescriptionException',
    () => {
        // Arrange
        const invalidDescription = 'too short';

        // Act & Assert
        assertThrows(
            () => SuggestionDescription.create(invalidDescription),
            InvalidSuggestionDescriptionException,
        );
    },
);

Deno.test(
    '[Unit] - SuggestionDescription - create - too long - throws InvalidSuggestionDescriptionException',
    () => {
        // Arrange
        const invalidDescription = 'a'.repeat(2001);

        // Act & Assert
        assertThrows(
            () => SuggestionDescription.create(invalidDescription),
            InvalidSuggestionDescriptionException,
        );
    },
);

Deno.test('[Unit] - SuggestionDescription - equals - same value - returns true', () => {
    // Arrange
    const left = SuggestionDescription.create('Add keyboard shortcuts for booking flow.');
    const right = SuggestionDescription.create(' Add keyboard shortcuts for booking flow. ');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - SuggestionDescription - equals - different value - returns false', () => {
    // Arrange
    const left = SuggestionDescription.create('Improve accessibility across dialogs.');
    const right = SuggestionDescription.create('Improve analytics dashboard loading speed.');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - SuggestionDescription - toString - valid value object - returns value', () => {
    // Arrange
    const description = SuggestionDescription.create('Improve accessibility across dialogs.');

    // Act
    const result = description.toString();

    // Assert
    assertEquals(result, 'Improve accessibility across dialogs.');
});
