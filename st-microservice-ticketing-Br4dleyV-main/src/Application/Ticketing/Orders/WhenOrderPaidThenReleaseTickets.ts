import type { Policy, UseCase } from '@/Application/Ports/mod.ts';
import { ServiceProvider } from '@domaincrafters/di';
import { OrderPaid } from '@/Domain/Ticketing/Orders/mod.ts';
import { ReleaseTickets, type ReleaseTicketsInput } from './ReleaseTickets.ts';

export class WhenOrderPaidThenReleaseTickets implements Policy<OrderPaid> {
    constructor(private readonly _serviceProvider: ServiceProvider) {}

    async handle(event: OrderPaid): Promise<void> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<ReleaseTicketsInput, void>
        >(ReleaseTickets.name)).getOrThrow();

        await useCase.execute({
            orderId: event.orderId,
        });
    }
}
