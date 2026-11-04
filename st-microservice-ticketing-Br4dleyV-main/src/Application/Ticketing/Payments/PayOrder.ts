import type { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import type { PaymentService } from '@/Application/Ports/Gateways/mod.ts';
import { NotFoundDomainException } from '@/Domain/Shared/mod.ts';
import { Order, OrderId, type OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { Payment, type PaymentRepository } from '@/Domain/Ticketing/Payments/mod.ts';

export interface PayOrderInput {
    orderId: string;
    externalId: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    bookingId: string;
    amount: number;
}

export class PayOrder implements UseCase<PayOrderInput, string> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _paymentService: PaymentService,
        private readonly _logger: Logger,
    ) {}

    async execute(input: PayOrderInput): Promise<string> {
        this._logger.debug('Processing payment for order', {
            orderId: input.orderId,
            amount: input.amount,
        });

        return await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const order = await orderRepository.byId(OrderId.create(input.orderId));

            if (!order.isPresent) {
                throw new NotFoundDomainException(`Order '${input.orderId}' not found while processing payment.`);
            }

            const orderAggregate = order.getOrThrow();
            const paymentRepository = this._unitOfWork.getRepository<PaymentRepository>(Payment.name);
            const payment = Payment.create(
                input.externalId,
                input.paymentMethod,
                input.cardNumber,
                input.expiryDate,
                input.cvv,
                orderAggregate.id.value,
                orderAggregate.bookingId.value,
                input.amount,
            );

            await this._unitOfWork.save(payment);

            const response = await this._paymentService.pay({
                amount: input.amount,
                cardNumber: input.cardNumber,
                expiryDate: input.expiryDate,
                cvv: input.cvv,
                paymentMethod: input.paymentMethod,
            });

            if (response.success) {
                payment.succeed();
            } else {
                payment.fail(response.failureReason ?? 'Payment failed');
            }

            await this._unitOfWork.save(payment);

            this._logger.info('Payment processed', {
                paymentId: payment.id.value,
                orderId: payment.orderId.value,
                bookingId: payment.bookingId.value,
                status: payment.status.value,
                repository: paymentRepository.constructor.name,
            });

            return payment.id.value;
        });
    }
}