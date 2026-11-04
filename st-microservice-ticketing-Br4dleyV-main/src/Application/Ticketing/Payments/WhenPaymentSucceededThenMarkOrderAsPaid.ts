import type { Policy, UseCase } from '@/Application/Ports/mod.ts';
import { ServiceProvider } from '@domaincrafters/di';
import { PaymentSucceeded } from '@/Domain/Ticketing/Payments/Events/PaymentSucceeded.ts';
import { MarkOrderAsPaid, type MarkOrderAsPaidInput } from '../Orders/MarkOrderAsPaid.ts';

export class WhenPaymentSucceededThenMarkOrderAsPaid
    implements Policy<PaymentSucceeded> {
    constructor(private readonly _serviceProvider: ServiceProvider) {}

    async handle(event: PaymentSucceeded): Promise<void> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<MarkOrderAsPaidInput, void>
        >(MarkOrderAsPaid.name)).getOrThrow();

        await useCase.execute({
            orderId: event.orderId,
        });
    }
}

