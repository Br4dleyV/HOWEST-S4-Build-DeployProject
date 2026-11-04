import { assertEquals, assertThrows } from '@std/assert';
import {
    InvalidSuggestionDescriptionException,
    InvalidSuggestionTitleException,
    Suggestion,
    SuggestionCreatedDomainEvent,
    SuggestionId,
} from '@/Domain/Ticketing/Suggestions/mod.ts';
import { InvalidEmailException } from '@/Domain/Shared/mod.ts';

Deno.test('[Unit] - Suggestion - create - valid input - returns aggregate with value objects', () => {
    // Arrange
    const email = '  USER@Example.COM  ';
    const title = '  Improve booking performance  ';
    const description = '  Cache frequently requested movie data to reduce latency.  ';

    // Act
    const suggestion = Suggestion.create(email, title, description);

    // Assert
    assertEquals(suggestion.email.value, 'user@example.com');
    assertEquals(suggestion.title.value, 'Improve booking performance');
    assertEquals(
        suggestion.description.value,
        'Cache frequently requested movie data to reduce latency.',
    );
    assertEquals(suggestion.id instanceof SuggestionId, true);
});

Deno.test('[Unit] - Suggestion - create - valid input - raises SuggestionCreatedDomainEvent', () => {
    // Arrange
    const suggestion = Suggestion.create(
        'user@example.com',
        'Improve booking performance',
        'Cache frequently requested movie data to reduce latency.',
    );

    // Act
    const events = suggestion.pullDomainEvents();

    // Assert
    assertEquals(events.length, 1);
    assertEquals(events[0] instanceof SuggestionCreatedDomainEvent, true);
});

Deno.test('[Unit] - Suggestion - create - valid input - created event contains full payload', () => {
    // Arrange
    const suggestion = Suggestion.create(
        'user@example.com',
        'Improve booking performance',
        'Cache frequently requested movie data to reduce latency.',
    );

    // Act
    const event = suggestion.pullDomainEvents()[0] as SuggestionCreatedDomainEvent;

    // Assert
    assertEquals(event.suggestionId, suggestion.id.value);
    assertEquals(event.email, 'user@example.com');
    assertEquals(event.title, 'Improve booking performance');
    assertEquals(
        event.description,
        'Cache frequently requested movie data to reduce latency.',
    );
    assertEquals(event.occurredOn instanceof Date, true);
    assertEquals(event.FQDN.value, 'howestprime.ticketing.suggestions.created');
});

Deno.test('[Unit] - Suggestion - create - invalid email - throws InvalidEmailException', () => {
    // Arrange
    const invalidEmail = 'not-an-email';

    // Act & Assert
    assertThrows(
        () => {
            Suggestion.create(
                invalidEmail,
                'Improve booking performance',
                'Cache frequently requested movie data to reduce latency.',
            );
        },
        InvalidEmailException,
    );
});

Deno.test('[Unit] - Suggestion - create - invalid title - throws InvalidSuggestionTitleException', () => {
    // Arrange
    const invalidTitle = 'ab';

    // Act & Assert
    assertThrows(
        () => {
            Suggestion.create(
                'user@example.com',
                invalidTitle,
                'Cache frequently requested movie data to reduce latency.',
            );
        },
        InvalidSuggestionTitleException,
    );
});

Deno.test(
    '[Unit] - Suggestion - create - invalid description - throws InvalidSuggestionDescriptionException',
    () => {
        // Arrange
        const invalidDescription = 'too short';

        // Act & Assert
        assertThrows(
            () => {
                Suggestion.create(
                    'user@example.com',
                    'Improve booking performance',
                    invalidDescription,
                );
            },
            InvalidSuggestionDescriptionException,
        );
    },
);
