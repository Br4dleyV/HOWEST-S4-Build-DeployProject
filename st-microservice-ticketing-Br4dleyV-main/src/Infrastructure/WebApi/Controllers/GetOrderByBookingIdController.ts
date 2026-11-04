import type { UseCase } from '@/Application/Ports/mod.ts';
import type { OrderData } from '@/Application/Ports/Queries/mod.ts';
import type {
    GetOrderByBookingIdQueryUseCaseInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class GetOrderByBookingIdController implements WebApiController {
    constructor(
        private readonly _getOrderByBookingIdUseCase: UseCase<
            GetOrderByBookingIdQueryUseCaseInput,
            OrderData
        >,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const bookingId = this.extractBookingId(ctx);
        const order = await this._getOrderByBookingIdUseCase.execute({
            bookingId,
        });

        WebApiResult.ok(ctx, order);
    }

    private extractBookingId(ctx: RouterContext<string>): string {
        const bookingId = ctx.params.bookingId;
        if (typeof bookingId !== 'string' || bookingId.trim().length === 0) {
            throw new IllegalArgumentException('Route parameter bookingId is required.');
        }

        return bookingId;
    }
}