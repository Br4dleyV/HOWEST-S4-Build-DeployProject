import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type {
    GetSuggestionByIdQueryPort,
    SuggestionByIdReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { SuggestionNotFoundApplicationException } from '@/Application/Shared/mod.ts';

export interface GetSuggestionByIdQueryUseCaseInput {
    suggestionId: string;
}

export class GetSuggestionByIdQueryUseCase
    implements UseCase<GetSuggestionByIdQueryUseCaseInput, SuggestionByIdReadModel> {
    constructor(
        private readonly _getSuggestionByIdQueryPort: GetSuggestionByIdQueryPort,
        private readonly _logger: Logger,
    ) {}

    async execute(input: GetSuggestionByIdQueryUseCaseInput): Promise<SuggestionByIdReadModel> {
        this._logger.debug('Getting suggestion by id', { suggestionId: input.suggestionId });

        const suggestion = await this._getSuggestionByIdQueryPort.getSuggestionById(
            input.suggestionId,
        );

        if (!suggestion.isPresent) {
            throw new SuggestionNotFoundApplicationException(input.suggestionId);
        }

        const readModel = suggestion.getOrThrow(
            `Suggestion with id '${input.suggestionId}' should be present.`,
        );

        this._logger.info('Suggestion found', { suggestionId: readModel.id });

        return readModel;
    }
}
