import type { Logger, Policy } from '@/Application/Ports/mod.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';

export class WhenSuggestionCreatedConsoleLogSuggestion
    implements Policy<SuggestionCreatedDomainEvent> {
    constructor(private readonly _logger: Logger) {}

    async handle(event: SuggestionCreatedDomainEvent): Promise<void> {
        this._logger.debug('Handling suggestion created event for console logging', {
            suggestionId: event.suggestionId,
        });

        this._logger.info(
            `\x1b[32mSuggestion created: ${event.title}\x1b[0m`,
            {
                suggestionId: event.suggestionId,
                email: event.email,
                title: event.title,
                description: event.description,
            },
        );

        await Promise.resolve();
    }
}
