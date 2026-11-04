import type { Policy, UseCase } from '@/Application/Ports/mod.ts';
import { ServiceProvider } from '@domaincrafters/di';
import { PaymentFailed } from '@/Domain/Ticketing/Payments/Events/PaymentFailed.ts';
import { CancelOrder, type CancelOrderInput } from '../Orders/CancelOrder.ts';

export class WhenPaymentFailedThenCancelOrder
    implements Policy<PaymentFailed> {
    constructor(private readonly _serviceProvider: ServiceProvider) {}

    async handle(event: PaymentFailed): Promise<void> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<CancelOrderInput, void>
        >(CancelOrder.name)).getOrThrow();

        await useCase.execute({
            orderId: event.orderId,
            reason: event.reason,
        });
    }
}
