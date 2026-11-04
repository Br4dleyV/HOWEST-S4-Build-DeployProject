import type { Optional } from '@domaincrafters/std';

export interface SuggestionByIdReadModel {
    id: string;
    email: string;
    title: string;
    description: string;
}

export interface GetSuggestionByIdQueryPort {
    getSuggestionById(suggestionId: string): Promise<Optional<SuggestionByIdReadModel>>;
}
