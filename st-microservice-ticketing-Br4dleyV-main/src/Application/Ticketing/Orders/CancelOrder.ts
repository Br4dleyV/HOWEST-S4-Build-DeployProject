import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import { Order, OrderId, type OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface CancelOrderInput {
    orderId: string;
    reason: string;
}

export class CancelOrder implements UseCase<CancelOrderInput, void> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(unitOfWork: UnitOfWork, logger: Logger) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: CancelOrderInput): Promise<void> {
        this._logger.debug('Cancelling order', {
            orderId: input.orderId,
            reason: input.reason,
        });

        return await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const order = await orderRepository.byId(OrderId.create(input.orderId));

            if (!order.isPresent) {
                throw new NotFoundDomainException(
                    `Order '${input.orderId}' not found while cancelling order.`,
                );
            }

            const orderAggregate = order.getOrThrow();

            if (orderAggregate.status.value !== 'open') {
                throw new IllegalArgumentException(
                    `Order '${input.orderId}' is not in open state. Current state: ${orderAggregate.status.value}.`,
                );
            }

            orderAggregate.cancel(input.reason);

            await this._unitOfWork.save(orderAggregate);

            this._logger.info('Order cancelled', {
                orderId: orderAggregate.id.value,
                bookingId: orderAggregate.bookingId.value,
                reason: input.reason,
            });
        });
    }
}
