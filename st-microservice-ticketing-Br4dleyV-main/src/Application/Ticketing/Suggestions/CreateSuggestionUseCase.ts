import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { Suggestion } from '@/Domain/Ticketing/Suggestions/mod.ts';

export interface CreateSuggestionUseCaseInput {
    email: string;
    title: string;
    description: string;
}

export class CreateSuggestionUseCase implements UseCase<CreateSuggestionUseCaseInput, string> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: CreateSuggestionUseCaseInput): Promise<string> {
        this._logger.debug('Creating suggestion', { input });

        return await this._unitOfWork.do<string>(async () => {
            const suggestion = Suggestion.create(
                input.email,
                input.title,
                input.description,
            );

            await this._unitOfWork.save(suggestion);

            this._logger.info('Suggestion created', {
                suggestionId: suggestion.id.value,
            });

            return suggestion.id.value;
        });
    }
}
