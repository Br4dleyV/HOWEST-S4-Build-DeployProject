import { MongoDbClient, MongoDbUnitOfWork } from './mod.ts';
import { MongoClient } from '@mongodb';

import type {
    ServiceCollection,
    ServiceDisposer,
    ServiceFactory,
    ServiceProvider,
} from '@domaincrafters/di';
import { Config } from '@/Infrastructure/Shared/mod.ts';
import { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';

export class MongoDbServices {
    static add(
        config: Config,
        serviceCollection: ServiceCollection,
        repositoryKeys: Array<string> = [],
    ): void {
        this.addMongoDbClient(config, serviceCollection)
            .addUnitOfWork(serviceCollection, repositoryKeys);
    }

    static addMongoDbClient(
        config: Config,
        serviceCollection: ServiceCollection,
    ): typeof MongoDbServices {
        serviceCollection.addScoped(
            MongoDbClient.name,
            this.mongoDbServiceFactory(config),
            this.buildMongoDbServiceDisposer(),
        );

        return this;
    }

    static addUnitOfWork(
        serviceCollection: ServiceCollection,
        repositoryKeys: Array<string>,
    ): typeof MongoDbServices {
        serviceCollection.addScoped(
            MongoDbUnitOfWork.name,
            async (_serviceProvider: ServiceProvider) => {
                const mongoDbClient: MongoDbClient =
                    (await _serviceProvider.getService<MongoDbClient>(MongoDbClient.name)).value;

                const unitOfWork = new MongoDbUnitOfWork(mongoDbClient.session);

                // Register all repositories with the unit of work
                for (const repositoryKey of repositoryKeys) {
                    const repository = (await _serviceProvider.getService<
                        Repository<AggregateRoot<EntityId>, EntityId>
                    >(
                        repositoryKey,
                    ))
                        .value;

                    unitOfWork.registerRepository(repository);
                }

                return unitOfWork;
            },
        );

        return this;
    }

    private static buildMongoDbServiceDisposer(): ServiceDisposer<MongoDbClient> {
        return async (mongoDbClient: MongoDbClient): Promise<void> => {
            await mongoDbClient.close();
        };
    }

    private static mongoDbServiceFactory(config: Config): ServiceFactory {
        return async (
            _serviceProvider: ServiceProvider,
        ): Promise<MongoDbClient> => {
            const protocol: string = config.get('PERSISTENCE_MONGO_DB_PROTOCOL');
            const user: string = config.get('PERSISTENCE_MONGO_DB_USER');
            const pass: string = config.get('PERSISTENCE_MONGO_DB_PASS');
            const host: string = config.get('PERSISTENCE_MONGO_DB_HOST');
            const port: string = config.get('PERSISTENCE_MONGO_DB_PORT');
            const dbName: string = config.get('PERSISTENCE_MONGO_DB_NAME');
            const options: string = config.get('PERSISTENCE_MONGO_DB_OPTIONS');
            const directConnection: boolean =
                config.get('PERSISTENCE_MONGO_DB_DIRECT_CONNECTION') === 'true';

            const connectionString: string = MongoDbClient
                .createConnectionString(protocol, host, port, options, dbName, user, pass);

            const clientOptions = {
                directConnection,
            };

            const client: MongoClient = new MongoClient(connectionString, clientOptions);

            // Connect the client before returning
            await client.connect();

            return new MongoDbClient(client);
        };
    }

    static createNativeMongoClient(
        config: Config,
    ): MongoClient {
        const protocol: string = config.get('PERSISTENCE_MONGO_DB_PROTOCOL');
        const user: string = config.get('PERSISTENCE_MONGO_DB_USER');
        const pass: string = config.get('PERSISTENCE_MONGO_DB_PASS');
        const host: string = config.get('PERSISTENCE_MONGO_DB_HOST');
        const port: string = config.get('PERSISTENCE_MONGO_DB_PORT');
        const dbName: string = config.get('PERSISTENCE_MONGO_DB_NAME');
        const options: string = config.get('PERSISTENCE_MONGO_DB_OPTIONS');
        const directConnection: boolean =
            config.get('PERSISTENCE_MONGO_DB_DIRECT_CONNECTION') === 'true';

        const connectionString: string = MongoDbClient
            .createConnectionString(protocol, host, port, options, dbName, user, pass);

        return new MongoClient(connectionString, {
            directConnection,
        });
    }
}
