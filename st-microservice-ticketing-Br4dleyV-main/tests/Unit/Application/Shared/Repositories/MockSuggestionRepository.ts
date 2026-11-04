import { Optional } from '@domaincrafters/std';

import type { Suggestion, SuggestionId, SuggestionRepository } from '@/Domain/Ticketing/Suggestions/mod.ts';

interface MockSuggestionRepositoryOptions {
    byId?: (id: SuggestionId) => Promise<Optional<Suggestion>>;
    save?: (suggestion: Suggestion) => Promise<void>;
    remove?: (suggestion: Suggestion) => Promise<void>;
    existingSuggestions?: Suggestion[];
}

export function createMockSuggestionRepository(
    options: MockSuggestionRepositoryOptions = {},
): SuggestionRepository & {
    byIdCalled: boolean;
    byIdCallCount: number;
    saveCalled: boolean;
    saveCallCount: number;
    removeCalled: boolean;
    removeCallCount: number;
    savedSuggestions: Suggestion[];
    removedSuggestions: Suggestion[];
    storedSuggestions: Map<string, Suggestion>;
} {
    const storedSuggestions = new Map<string, Suggestion>(
        (options.existingSuggestions ?? []).map((suggestion) => [suggestion.id.value, suggestion]),
    );
    const savedSuggestions: Suggestion[] = [];
    const removedSuggestions: Suggestion[] = [];

    const mock = {
        byIdCalled: false,
        byIdCallCount: 0,
        saveCalled: false,
        saveCallCount: 0,
        removeCalled: false,
        removeCallCount: 0,
        savedSuggestions,
        removedSuggestions,
        storedSuggestions,

        byId: async (id: SuggestionId): Promise<Optional<Suggestion>> => {
            mock.byIdCalled = true;
            mock.byIdCallCount++;

            if (options.byId) {
                return await options.byId(id);
            }

            const suggestion = storedSuggestions.get(id.value);
            if (!suggestion) {
                return Optional.empty<Suggestion>();
            }

            return Optional.of<Suggestion>(suggestion);
        },

        save: async (suggestion: Suggestion): Promise<void> => {
            mock.saveCalled = true;
            mock.saveCallCount++;
            savedSuggestions.push(suggestion);

            if (options.save) {
                await options.save(suggestion);
                return;
            }

            storedSuggestions.set(suggestion.id.value, suggestion);
        },

        remove: async (suggestion: Suggestion): Promise<void> => {
            mock.removeCalled = true;
            mock.removeCallCount++;
            removedSuggestions.push(suggestion);

            if (options.remove) {
                await options.remove(suggestion);
                return;
            }

            storedSuggestions.delete(suggestion.id.value);
        },
    };

    return mock as SuggestionRepository & {
        byIdCalled: boolean;
        byIdCallCount: number;
        saveCalled: boolean;
        saveCallCount: number;
        removeCalled: boolean;
        removeCallCount: number;
        savedSuggestions: Suggestion[];
        removedSuggestions: Suggestion[];
        storedSuggestions: Map<string, Suggestion>;
    };
}
