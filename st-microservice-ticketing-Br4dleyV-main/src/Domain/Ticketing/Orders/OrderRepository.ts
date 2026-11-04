import type { Repository } from '@/Domain/Shared/mod.ts';
import type { Order, OrderId } from './Order.ts';

export interface OrderRepository extends Repository<Order, OrderId> {}
