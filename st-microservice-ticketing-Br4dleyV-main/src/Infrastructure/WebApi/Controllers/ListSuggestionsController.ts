import type { UseCase } from '@/Application/Ports/mod.ts';
import type { SuggestionListItemReadModel } from '@/Application/Ports/Queries/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';

export class ListSuggestionsController implements WebApiController {
    constructor(
        private readonly _listSuggestionsUseCase: UseCase<void, SuggestionListItemReadModel[]>,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const suggestions = await this._listSuggestionsUseCase.execute(undefined);
        WebApiResult.ok(ctx, suggestions);
    }
}
