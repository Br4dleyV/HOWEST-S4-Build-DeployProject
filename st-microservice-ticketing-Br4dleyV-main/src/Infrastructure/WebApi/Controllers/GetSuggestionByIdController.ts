import type { GetSuggestionByIdQueryUseCaseInput } from '@/Application/Ticketing/Suggestions/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import type { SuggestionByIdReadModel } from '@/Application/Ports/Queries/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class GetSuggestionByIdController implements WebApiController {
    constructor(
        private readonly _getSuggestionByIdUseCase: UseCase<
            GetSuggestionByIdQueryUseCaseInput,
            SuggestionByIdReadModel
        >,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const suggestionId = this.extractSuggestionId(ctx);
        const suggestion = await this._getSuggestionByIdUseCase.execute({
            suggestionId,
        });

        WebApiResult.ok(ctx, suggestion);
    }

    private extractSuggestionId(ctx: RouterContext<string>): string {
        const suggestionId = ctx.params.suggestionId;
        if (typeof suggestionId !== 'string' || suggestionId.trim().length === 0) {
            throw new IllegalArgumentException('Route parameter suggestionId is required.');
        }

        return suggestionId;
    }
}
