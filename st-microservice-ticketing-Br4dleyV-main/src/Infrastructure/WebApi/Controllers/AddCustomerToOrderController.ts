import type { AddCustomerToOrderInput } from '@/Application/Ticketing/Orders/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface AddCustomerToOrderRequest {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    agreeToTerms: boolean;
}

export class AddCustomerToOrderController implements WebApiController {
    constructor(
        private readonly _addCustomerToOrderUseCase: UseCase<AddCustomerToOrderInput, string>,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const requestBody = await ctx.request.body.json();
        const input = this.mapToUseCaseInput(ctx.params.orderId, requestBody);
        const savedOrderId = await this._addCustomerToOrderUseCase.execute(input);

        WebApiResult.created(ctx, `/api/orders/${savedOrderId}`);
    }

    private mapToUseCaseInput(orderId: unknown, payload: unknown): AddCustomerToOrderInput {
        if (payload === null || typeof payload !== 'object') {
            throw new IllegalArgumentException('Request body must be a JSON object.');
        }

        const body = payload as Record<string, unknown>;

        return {
            orderId: this.requireNonEmptyString(orderId, 'orderId'),
            salutation: this.requireNonEmptyString(body.salutation, 'salutation'),
            firstName: this.requireNonEmptyString(body.firstName, 'firstName'),
            lastName: this.requireNonEmptyString(body.lastName, 'lastName'),
            email: this.requireNonEmptyString(body.email, 'email'),
            agreeToTerms: this.requireBoolean(body.agreeToTerms, 'agreeToTerms'),
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

    private requireBoolean(value: unknown, field: string): boolean {
        if (typeof value !== 'boolean') {
            throw new IllegalArgumentException(`Field '${field}' must be a boolean.`);
        }

        return value;
    }
}