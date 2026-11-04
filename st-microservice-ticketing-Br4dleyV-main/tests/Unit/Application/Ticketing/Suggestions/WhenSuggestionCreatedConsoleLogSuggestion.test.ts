import { assertEquals, assertRejects } from '@std/assert';
import { type Logger } from '@/Application/Ports/mod.ts';
import { WhenSuggestionCreatedConsoleLogSuggestion } from '@/Application/Ticketing/Suggestions/mod.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';

Deno.test(
    '[Unit] - WhenSuggestionCreatedConsoleLogSuggestion - handle - valid event - logs suggestion in green',
    async () => {
        // Arrange
        const debugCalls: Array<{
            message: string;
            context?: Record<string, unknown>;
        }> = [];
        const infoCalls: Array<{
            message: string;
            context?: Record<string, unknown>;
        }> = [];

        const logger: Logger = {
            debug: (message, context) => {
                debugCalls.push({ message, context });
            },
            info: (message, context) => {
                infoCalls.push({ message, context });
            },
            warn: () => {},
            error: () => {},
        };
        const policy = new WhenSuggestionCreatedConsoleLogSuggestion(logger);
        const event = SuggestionCreatedDomainEvent.create(
            'suggestion-1',
            'user@example.com',
            'Improve notifications',
            'Add more context to confirmation notifications.',
        );

        // Act
        await policy.handle(event);

        // Assert
        assertEquals(debugCalls.length, 1);
        assertEquals(infoCalls.length, 1);
        const firstInfoCall = infoCalls[0]!;
        assertEquals(
            firstInfoCall.message,
            '\x1b[32mSuggestion created: Improve notifications\x1b[0m',
        );
        assertEquals(
            firstInfoCall.context,
            {
                suggestionId: 'suggestion-1',
                email: 'user@example.com',
                title: 'Improve notifications',
                description: 'Add more context to confirmation notifications.',
            },
        );
    },
);

Deno.test(
    '[Unit] - WhenSuggestionCreatedConsoleLogSuggestion - handle - logger info fails - propagates error',
    async () => {
        // Arrange
        const expectedError = new Error('Logger failure');
        const logger: Logger = {
            debug: () => {},
            info: () => {
                throw expectedError;
            },
            warn: () => {},
            error: () => {},
        };
        const policy = new WhenSuggestionCreatedConsoleLogSuggestion(logger);
        const event = SuggestionCreatedDomainEvent.create(
            'suggestion-2',
            'user@example.com',
            'Improve search',
            'Add typo tolerance in search results.',
        );

        // Act & Assert
        await assertRejects(
            () => policy.handle(event),
            Error,
            'Logger failure',
        );
    },
);
