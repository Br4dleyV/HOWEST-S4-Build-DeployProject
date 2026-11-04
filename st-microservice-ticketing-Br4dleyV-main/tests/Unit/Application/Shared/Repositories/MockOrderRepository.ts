import { Optional } from '@domaincrafters/std';

import type { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';

interface MockOrderRepositoryOptions {
    byId?: (id: OrderId) => Promise<Optional<Order>>;
    save?: (order: Order) => Promise<void>;
    remove?: (order: Order) => Promise<void>;
    existingOrders?: Order[];
}

export function createMockOrderRepository(
    options: MockOrderRepositoryOptions = {},
): OrderRepository & {
    byIdCalled: boolean;
    byIdCallCount: number;
    saveCalled: boolean;
    saveCallCount: number;
    removeCalled: boolean;
    removeCallCount: number;
    savedOrders: Order[];
    removedOrders: Order[];
    storedOrders: Map<string, Order>;
} {
    const storedOrders = new Map<string, Order>(
        (options.existingOrders ?? []).map((order) => [order.id.value, order]),
    );
    const savedOrders: Order[] = [];
    const removedOrders: Order[] = [];

    const mock = {
        byIdCalled: false,
        byIdCallCount: 0,
        saveCalled: false,
        saveCallCount: 0,
        removeCalled: false,
        removeCallCount: 0,
        savedOrders,
        removedOrders,
        storedOrders,

        byId: async (id: OrderId): Promise<Optional<Order>> => {
            mock.byIdCalled = true;
            mock.byIdCallCount++;

            if (options.byId) {
                return await options.byId(id);
            }

            const order = storedOrders.get(id.value);
            if (!order) {
                return Optional.empty<Order>();
            }

            return Optional.of<Order>(order);
        },

        save: async (order: Order): Promise<void> => {
            mock.saveCalled = true;
            mock.saveCallCount++;
            savedOrders.push(order);

            if (options.save) {
                await options.save(order);
                return;
            }

            storedOrders.set(order.id.value, order);
        },

        remove: async (order: Order): Promise<void> => {
            mock.removeCalled = true;
            mock.removeCallCount++;
            removedOrders.push(order);

            if (options.remove) {
                await options.remove(order);
                return;
            }

            storedOrders.delete(order.id.value);
        },
    };

    return mock as OrderRepository & {
        byIdCalled: boolean;
        byIdCallCount: number;
        saveCalled: boolean;
        saveCallCount: number;
        removeCalled: boolean;
        removeCallCount: number;
        savedOrders: Order[];
        removedOrders: Order[];
        storedOrders: Map<string, Order>;
    };
}
