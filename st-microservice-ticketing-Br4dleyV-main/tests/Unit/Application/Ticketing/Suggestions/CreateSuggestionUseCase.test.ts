import { assertEquals, assertRejects } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import { CreateSuggestionUseCase } from '@/Application/Ticketing/Suggestions/mod.ts';
import { InvalidEmailException } from '@/Domain/Shared/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - CreateSuggestionUseCase - execute - valid input - creates and saves suggestion',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new CreateSuggestionUseCase(unitOfWork, mockLogger);

        // Act
        const result = await useCase.execute({
            email: 'user@example.com',
            title: 'Improve booking performance',
            description: 'Cache frequently requested movie data to reduce latency.',
        });

        // Assert
        assertEquals(typeof result, 'string');
        assertEquals(result.length > 0, true);
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.getRepositoryCalled, false);
        assertEquals(unitOfWork.saveCalled, true);
        assertEquals(unitOfWork.saveCallCount, 1);
    },
);

Deno.test(
    '[Unit] - CreateSuggestionUseCase - execute - invalid email - propagates InvalidEmailException',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new CreateSuggestionUseCase(unitOfWork, mockLogger);

        // Act & Assert
        await assertRejects(
            () =>
                useCase.execute({
                    email: 'not-an-email',
                    title: 'Improve booking performance',
                    description: 'Cache frequently requested movie data to reduce latency.',
                }),
            InvalidEmailException,
        );

        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.getRepositoryCalled, false);
        assertEquals(unitOfWork.saveCalled, false);
    },
);
