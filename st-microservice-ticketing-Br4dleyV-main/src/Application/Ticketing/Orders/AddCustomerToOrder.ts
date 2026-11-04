import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import {
    Customer,
    Order,
    OrderId,
    type OrderRepository,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export interface AddCustomerToOrderInput {
    orderId: string;
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    agreeToTerms: boolean;
}

export class AddCustomerToOrder implements UseCase<AddCustomerToOrderInput, string> {
    private readonly _unitOfWork: UnitOfWork;
    private readonly _logger: Logger;

    constructor(unitOfWork: UnitOfWork, logger: Logger) {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
    }

    async execute(input: AddCustomerToOrderInput): Promise<string> {
        this._logger.debug('Adding customer information to order', {
            orderId: input.orderId,
            agreeToTerms: input.agreeToTerms,
        });

        return await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const order = await orderRepository.byId(OrderId.create(input.orderId));

            if (!order.isPresent) {
                throw new NotFoundDomainException(
                    `Order '${input.orderId}' not found while adding customer information.`,
                );
            }

            if (!input.agreeToTerms) {
                throw new IllegalArgumentException('agreeToTerms must be true before adding customer information.');
            }

            const customer = Customer.create(
                input.salutation,
                input.firstName,
                input.lastName,
                input.email,
            );

            const orderAggregate = order.getOrThrow();
            orderAggregate.acceptTerms();
            orderAggregate.addCustomer(customer);

            await this._unitOfWork.save(orderAggregate);

            this._logger.info('Customer information added to order', {
                orderId: orderAggregate.id.value,
            });

            return orderAggregate.id.value;
        });
    }
}