import { WhenSuggestionCreatedConsoleLogSuggestion } from '@/Application/Ticketing/Suggestions/mod.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid, WhenPaymentFailedThenCancelOrder } from '@/Application/Ticketing/Payments/mod.ts';
import { WhenOrderPaidThenReleaseTickets } from '@/Application/Ticketing/Orders/mod.ts';
import { PaymentSucceeded, PaymentFailed } from '@/Domain/Ticketing/Payments/Events/mod.ts';
import { OrderPaid } from '@/Domain/Ticketing/Orders/mod.ts';

export const domainEventPolicies: Map<string, string[]> = new Map([
    [
        SuggestionCreatedDomainEvent.FQDN_VALUE.toString(),
        [WhenSuggestionCreatedConsoleLogSuggestion.name],
    ],
    [
        PaymentSucceeded.FQDN_VALUE.toString(),
        [WhenPaymentSucceededThenMarkOrderAsPaid.name],
    ],
    [
        PaymentFailed.FQDN_VALUE.toString(),
        [WhenPaymentFailedThenCancelOrder.name],
    ],
    [
        OrderPaid.FQDN_VALUE.toString(),
        [WhenOrderPaidThenReleaseTickets.name],
    ],
]);
