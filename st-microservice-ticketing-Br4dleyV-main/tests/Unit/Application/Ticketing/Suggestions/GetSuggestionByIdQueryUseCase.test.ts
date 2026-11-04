import { Optional } from '@domaincrafters/std';
import { assertEquals, assertRejects } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import type {
    GetSuggestionByIdQueryPort,
    SuggestionByIdReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { GetSuggestionByIdQueryUseCase } from '@/Application/Ticketing/Suggestions/mod.ts';
import { SuggestionNotFoundApplicationException } from '@/Application/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - GetSuggestionByIdQueryUseCase - execute - existing suggestion id - returns read model',
    async () => {
        // Arrange
        const suggestion: SuggestionByIdReadModel = {
            id: 'd16efc5f-5f83-4b50-8cbf-fcce6f2a5833',
            email: 'user@example.com',
            title: 'Improve booking performance',
            description: 'Cache frequently requested movie data to reduce latency.',
        };

        let queriedSuggestionId = '';
        const queryPort: GetSuggestionByIdQueryPort = {
            getSuggestionById: async (suggestionId: string) => {
                queriedSuggestionId = suggestionId;
                return Optional.of<SuggestionByIdReadModel>(suggestion);
            },
        };

        const useCase = new GetSuggestionByIdQueryUseCase(queryPort, mockLogger);
        const input = { suggestionId: suggestion.id };

        // Act
        const result = await useCase.execute(input);

        // Assert
        assertEquals(queriedSuggestionId, suggestion.id);
        assertEquals(result, suggestion);
    },
);

Deno.test(
    '[Unit] - GetSuggestionByIdQueryUseCase - execute - missing suggestion id - throws SuggestionNotFoundApplicationException',
    async () => {
        // Arrange
        const queryPort: GetSuggestionByIdQueryPort = {
            getSuggestionById: async () => Optional.empty<SuggestionByIdReadModel>(),
        };

        const useCase = new GetSuggestionByIdQueryUseCase(queryPort, mockLogger);
        const input = { suggestionId: 'd16efc5f-5f83-4b50-8cbf-fcce6f2a5833' };

        // Act & Assert
        await assertRejects(
            () => useCase.execute(input),
            SuggestionNotFoundApplicationException,
        );
    },
);
