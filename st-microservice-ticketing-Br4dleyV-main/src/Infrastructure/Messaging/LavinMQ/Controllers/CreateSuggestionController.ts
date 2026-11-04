import type { CreateSuggestionUseCaseInput } from '@/Application/Ticketing/Suggestions/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import type { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface CreateSuggestionRequest {
    email: unknown;
    title: unknown;
    description: unknown;
}

export class CreateSuggestionController implements AmqpController<CreateSuggestionRequest> {
    constructor(
        private readonly _createSuggestionUseCase: UseCase<CreateSuggestionUseCaseInput, string>,
    ) {}

    async handle(request: CreateSuggestionRequest): Promise<void> {
        const input = this.extractInput(request as unknown);
        await this._createSuggestionUseCase.execute(input);
    }

    private extractInput(request: unknown): CreateSuggestionUseCaseInput {
        if (request === null || typeof request !== 'object') {
            throw new IllegalArgumentException('Suggestion create payload must be a JSON object.');
        }

        const payload = request as Record<string, unknown>;
        if (Object.hasOwn(payload, 'payload')) {
            throw new IllegalArgumentException(
                "Unexpected wrapper field 'payload'. Expected direct fields: email, title, description.",
            );
        }

        return {
            email: this.requireNonEmptyString(payload.email, 'email'),
            title: this.requireNonEmptyString(payload.title, 'title'),
            description: this.requireNonEmptyString(payload.description, 'description'),
        };
    }

    private requireNonEmptyString(value: unknown, fieldName: string): string {
        if (typeof value !== 'string') {
            throw new IllegalArgumentException(`Field '${fieldName}' must be a string.`);
        }

        if (value.trim().length === 0) {
            throw new IllegalArgumentException(`Field '${fieldName}' must not be empty.`);
        }

        return value;
    }
}
