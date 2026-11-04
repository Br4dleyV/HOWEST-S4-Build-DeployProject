import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import { Order, OrderId, type OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface ReleaseTicketsInput {
    orderId: string;
}

export class ReleaseTickets implements UseCase<ReleaseTicketsInput, void> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(unitOfWork: UnitOfWork, logger: Logger) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: ReleaseTicketsInput): Promise<void> {
        this._logger.debug('Releasing tickets for order', {
            orderId: input.orderId,
        });

        return await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const order = await orderRepository.byId(OrderId.create(input.orderId));

            if (!order.isPresent) {
                throw new NotFoundDomainException(
                    `Order '${input.orderId}' not found while releasing tickets.`,
                );
            }

            const orderAggregate = order.getOrThrow();

            if (orderAggregate.status.value !== 'paid') {
                throw new IllegalArgumentException(
                    `Order '${input.orderId}' is not in paid state. Current state: ${orderAggregate.status.value}.`,
                );
            }

            orderAggregate.releaseTickets();

            await this._unitOfWork.save(orderAggregate);

            this._logger.info('Tickets released for order', {
                orderId: orderAggregate.id.value,
                bookingId: orderAggregate.bookingId.value,
            });
        });
    }
}
