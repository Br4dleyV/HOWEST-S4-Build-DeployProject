import { Payment, PaymentId, type PaymentRepository } from '@/Domain/Ticketing/Payments/mod.ts';
import { MongoDbClient, MongoDbRepository } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { PaymentDocumentMapper } from './Mappers/PaymentDocumentMapper.ts';

export class MongoDbPaymentRepository extends MongoDbRepository<Payment, PaymentId>
    implements PaymentRepository {
    static override readonly collectionName: string = 'payments';

    constructor(client: MongoDbClient, mapper: PaymentDocumentMapper) {
        super(client, mapper, MongoDbPaymentRepository.collectionName);
    }

    override get entityName(): string {
        return Payment.name;
    }
}