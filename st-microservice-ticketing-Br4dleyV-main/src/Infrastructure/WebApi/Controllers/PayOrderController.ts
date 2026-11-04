import type { PayOrderInput } from '@/Application/Ticketing/Payments/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface PayOrderRequest {
    externalId: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    bookingId: string;
    amount: number;
}

export class PayOrderController implements WebApiController {
    constructor(private readonly _payOrderUseCase: UseCase<PayOrderInput, string>) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const requestBody = await ctx.request.body.json();
        const input = this.mapToUseCaseInput(ctx.params.orderId, requestBody);
        const paymentId = await this._payOrderUseCase.execute(input);

        WebApiResult.created(ctx, `/api/orders/${input.orderId}/payments/${paymentId}`);
        ctx.response.type = 'application/json';
        ctx.response.body = { paymentId };
    }

    private mapToUseCaseInput(orderId: unknown, payload: unknown): PayOrderInput {
        if (payload === null || typeof payload !== 'object') {
            throw new IllegalArgumentException('Request body must be a JSON object.');
        }

        const body = payload as Record<string, unknown>;

        return {
            orderId: this.requireNonEmptyString(orderId, 'orderId'),
            externalId: this.requireNonEmptyString(body.externalId, 'externalId'),
            paymentMethod: this.requireNonEmptyString(body.paymentMethod, 'paymentMethod'),
            cardNumber: this.requireNonEmptyString(body.cardNumber, 'cardNumber'),
            expiryDate: this.requireNonEmptyString(body.expiryDate, 'expiryDate'),
            cvv: this.requireNonEmptyString(body.cvv, 'cvv'),
            bookingId: this.requireNonEmptyString(body.bookingId, 'bookingId'),
            amount: this.requirePositiveNumber(body.amount, 'amount'),
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

    private requirePositiveNumber(value: unknown, field: string): number {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
            throw new IllegalArgumentException(`Field '${field}' must be a positive number.`);
        }

        return value;
    }
}