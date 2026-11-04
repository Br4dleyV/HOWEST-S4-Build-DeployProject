import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import { Order, OrderId, type OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface MarkOrderAsPaidInput {
    orderId: string;
}

export class MarkOrderAsPaid implements UseCase<MarkOrderAsPaidInput, void> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(unitOfWork: UnitOfWork, logger: Logger) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: MarkOrderAsPaidInput): Promise<void> {
        this._logger.debug('Marking order as paid', {
            orderId: input.orderId,
        });

        return await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const order = await orderRepository.byId(OrderId.create(input.orderId));

            if (!order.isPresent) {
                throw new NotFoundDomainException(
                    `Order '${input.orderId}' not found while marking order as paid.`,
                );
            }

            const orderAggregate = order.getOrThrow();

            if (orderAggregate.status.value !== 'open') {
                throw new IllegalArgumentException(
                    `Order '${input.orderId}' is not in open state. Current state: ${orderAggregate.status.value}.`,
                );
            }

            if (!orderAggregate.agreeToTerms) {
                throw new IllegalArgumentException(
                    `Order '${input.orderId}' cannot be marked as paid because terms were not accepted.`,
                );
            }

            orderAggregate.markAsPaid();

            await this._unitOfWork.save(orderAggregate);

            this._logger.info('Order marked as paid', {
                orderId: orderAggregate.id.value,
                bookingId: orderAggregate.bookingId.value,
            });
        });
    }
}
