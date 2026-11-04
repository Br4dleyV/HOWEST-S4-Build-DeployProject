import { assertEquals, assertRejects } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import type {
    ListSuggestionsQueryPort,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { ListSuggestionsQueryUseCase } from '@/Application/Ticketing/Suggestions/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - ListSuggestionsQueryUseCase - execute - suggestions available - returns read models',
    async () => {
        // Arrange
        const suggestions: SuggestionListItemReadModel[] = [
            {
                id: '28f7389f-2e2f-47db-9dd2-4d1c0e1f4ceb',
                email: 'user1@example.com',
                title: 'Improve booking performance',
                description: 'Cache frequently requested movie data to reduce latency.',
            },
            {
                id: '14d74272-c8f0-4f61-8ed2-4a8d6d88fe7b',
                email: 'user2@example.com',
                title: 'Add keyboard shortcuts',
                description: 'Support keyboard navigation in booking screens.',
            },
        ];

        let listSuggestionsCallCount = 0;
        const queryPort: ListSuggestionsQueryPort = {
            listSuggestions: async () => {
                listSuggestionsCallCount++;
                return suggestions;
            },
        };

        const useCase = new ListSuggestionsQueryUseCase(queryPort, mockLogger);

        // Act
        const result = await useCase.execute(undefined);

        // Assert
        assertEquals(result, suggestions);
        assertEquals(listSuggestionsCallCount, 1);
    },
);

Deno.test(
    '[Unit] - ListSuggestionsQueryUseCase - execute - no suggestions available - returns empty list',
    async () => {
        // Arrange
        let listSuggestionsCallCount = 0;
        const queryPort: ListSuggestionsQueryPort = {
            listSuggestions: async () => {
                listSuggestionsCallCount++;
                return [];
            },
        };

        const useCase = new ListSuggestionsQueryUseCase(queryPort, mockLogger);

        // Act
        const result = await useCase.execute(undefined);

        // Assert
        assertEquals(result, []);
        assertEquals(listSuggestionsCallCount, 1);
    },
);

Deno.test(
    '[Unit] - ListSuggestionsQueryUseCase - execute - query port failure - propagates error',
    async () => {
        // Arrange
        const queryPort: ListSuggestionsQueryPort = {
            listSuggestions: async () => {
                throw new Error('Query failed');
            },
        };

        const useCase = new ListSuggestionsQueryUseCase(queryPort, mockLogger);

        // Act & Assert
        await assertRejects(
            () => useCase.execute(undefined),
            Error,
            'Query failed',
        );
    },
);
