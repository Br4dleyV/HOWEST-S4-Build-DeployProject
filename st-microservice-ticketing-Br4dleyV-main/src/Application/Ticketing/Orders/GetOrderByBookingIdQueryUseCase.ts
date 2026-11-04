import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type { GetOrderByBookingIdQueryPort, OrderData } from '@/Application/Ports/Queries/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';

export interface GetOrderByBookingIdQueryUseCaseInput {
    bookingId: string;
}

export class GetOrderByBookingIdQueryUseCase implements UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> {
    constructor(
        private readonly _getOrderByBookingIdQueryPort: GetOrderByBookingIdQueryPort,
        private readonly _logger: Logger,
    ) {}

    async execute(input: GetOrderByBookingIdQueryUseCaseInput): Promise<OrderData> {
        this._logger.debug('Getting order by booking id', { bookingId: input.bookingId });

        const order = await this._getOrderByBookingIdQueryPort.getOrderByBookingId(
            input.bookingId,
        );

        if (!order.isPresent) {
            throw new NotFoundDomainException(
                `Order with booking id '${input.bookingId}' was not found.`,
            );
        }

        const readModel = order.getOrThrow(
            `Order with booking id '${input.bookingId}' should be present.`,
        );

        this._logger.info('Order found', { bookingId: readModel.bookingId, orderId: readModel.id });

        return readModel;
    }
}