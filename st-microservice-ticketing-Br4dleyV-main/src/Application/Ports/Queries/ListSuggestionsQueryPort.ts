export interface SuggestionListItemReadModel {
    id: string;
    email: string;
    title: string;
    description: string;
}

export interface ListSuggestionsQueryPort {
    listSuggestions(): Promise<SuggestionListItemReadModel[]>;
}
