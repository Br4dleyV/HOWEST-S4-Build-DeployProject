import { Order, OrderId, type OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { MongoDbClient, MongoDbRepository } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { OrderDocumentMapper } from './Mappers/OrderDocumentMapper.ts';

export class MongoDbOrderRepository extends MongoDbRepository<Order, OrderId>
    implements OrderRepository {
    static override readonly collectionName: string = 'orders';

    constructor(client: MongoDbClient, mapper: OrderDocumentMapper) {
        super(client, mapper, MongoDbOrderRepository.collectionName);
    }

    override get entityName(): string {
        return Order.name;
    }
}
