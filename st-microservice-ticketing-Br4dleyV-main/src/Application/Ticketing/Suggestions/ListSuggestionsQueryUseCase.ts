import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type {
    ListSuggestionsQueryPort,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';

export class ListSuggestionsQueryUseCase implements UseCase<void, SuggestionListItemReadModel[]> {
    constructor(
        private readonly _listSuggestionsQueryPort: ListSuggestionsQueryPort,
        private readonly _logger: Logger,
    ) {}

    async execute(_input: void): Promise<SuggestionListItemReadModel[]> {
        this._logger.debug('Listing suggestions');

        const suggestions = await this._listSuggestionsQueryPort.listSuggestions();

        this._logger.info('Suggestions listed', {
            count: suggestions.length,
        });

        return suggestions;
    }
}
