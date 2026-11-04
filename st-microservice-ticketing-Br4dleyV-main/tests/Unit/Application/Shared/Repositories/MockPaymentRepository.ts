import { Optional } from '@domaincrafters/std';

import type { Payment, PaymentId, PaymentRepository } from '@/Domain/Ticketing/Payments/mod.ts';

interface MockPaymentRepositoryOptions {
    byId?: (id: PaymentId) => Promise<Optional<Payment>>;
    save?: (payment: Payment) => Promise<void>;
    remove?: (payment: Payment) => Promise<void>;
    existingPayments?: Payment[];
}

export function createMockPaymentRepository(
    options: MockPaymentRepositoryOptions = {},
): PaymentRepository & {
    byIdCalled: boolean;
    byIdCallCount: number;
    saveCalled: boolean;
    saveCallCount: number;
    removeCalled: boolean;
    removeCallCount: number;
    savedPayments: Payment[];
    removedPayments: Payment[];
    storedPayments: Map<string, Payment>;
} {
    const storedPayments = new Map<string, Payment>(
        (options.existingPayments ?? []).map((payment) => [payment.id.value, payment]),
    );
    const savedPayments: Payment[] = [];
    const removedPayments: Payment[] = [];

    const mock = {
        byIdCalled: false,
        byIdCallCount: 0,
        saveCalled: false,
        saveCallCount: 0,
        removeCalled: false,
        removeCallCount: 0,
        savedPayments,
        removedPayments,
        storedPayments,

        byId: async (id: PaymentId): Promise<Optional<Payment>> => {
            mock.byIdCalled = true;
            mock.byIdCallCount++;

            if (options.byId) {
                return await options.byId(id);
            }

            const payment = storedPayments.get(id.value);
            if (!payment) {
                return Optional.empty<Payment>();
            }

            return Optional.of<Payment>(payment);
        },

        save: async (payment: Payment): Promise<void> => {
            mock.saveCalled = true;
            mock.saveCallCount++;
            savedPayments.push(payment);

            if (options.save) {
                await options.save(payment);
                return;
            }

            storedPayments.set(payment.id.value, payment);
        },

        remove: async (payment: Payment): Promise<void> => {
            mock.removeCalled = true;
            mock.removeCallCount++;
            removedPayments.push(payment);

            if (options.remove) {
                await options.remove(payment);
                return;
            }

            storedPayments.delete(payment.id.value);
        },
    };

    return mock as PaymentRepository & {
        byIdCalled: boolean;
        byIdCallCount: number;
        saveCalled: boolean;
        saveCallCount: number;
        removeCalled: boolean;
        removeCallCount: number;
        savedPayments: Payment[];
        removedPayments: Payment[];
        storedPayments: Map<string, Payment>;
    };
}