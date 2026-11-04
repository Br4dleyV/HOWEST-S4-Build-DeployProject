import type { Repository } from '@/Domain/Shared/mod.ts';
import type { Payment, PaymentId } from './Payment.ts';

export type PaymentRepository = Repository<Payment, PaymentId>;