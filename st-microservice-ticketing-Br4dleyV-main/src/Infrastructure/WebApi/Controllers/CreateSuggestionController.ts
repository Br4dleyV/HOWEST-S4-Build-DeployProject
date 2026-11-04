import type { CreateSuggestionUseCaseInput } from '@/Application/Ticketing/Suggestions/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class CreateSuggestionController implements WebApiController {
    constructor(
        private readonly _createSuggestionUseCase: UseCase<CreateSuggestionUseCaseInput, string>,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const requestBody = await ctx.request.body.json();
        const input = this.mapToUseCaseInput(requestBody);
        const suggestionId = await this._createSuggestionUseCase.execute(input);

        WebApiResult.created(ctx, `/api/suggestions/${suggestionId}`);
    }

    private mapToUseCaseInput(payload: unknown): CreateSuggestionUseCaseInput {
        if (payload === null || typeof payload !== 'object') {
            throw new IllegalArgumentException('Request body must be a JSON object.');
        }

        const body = payload as Record<string, unknown>;
        return {
            email: this.requireNonEmptyString(body.email, 'email'),
            title: this.requireNonEmptyString(body.title, 'title'),
            description: this.requireNonEmptyString(body.description, 'description'),
        };
    }

    private requireNonEmptyString(value: unknown, field: string): string {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException(`Field '${field}' must be a string.`);
        }

        if (value.trim().length === 0) {
            throw new IllegalArgumentException(`Field '${field}' must not be empty.`);
        }

        return value;
    }
}
