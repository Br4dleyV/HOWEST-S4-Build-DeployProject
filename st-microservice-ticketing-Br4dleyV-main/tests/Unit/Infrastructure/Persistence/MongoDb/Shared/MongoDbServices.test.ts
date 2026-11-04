import { assertEquals } from '@std/assert';
import type { ServiceCollection, ServiceProvider } from '@domaincrafters/di';

import { MongoClient } from '@mongodb';
import { MongoDbClient, MongoDbServices, MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Config } from '@/Infrastructure/Shared/mod.ts';
import { MongoDbMovieRepository, MongoDbSuggestionRepository } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';

function createConfig(values: Record<string, string>) {
    return {
        get: (key: string) => values[key] ?? '',
    } as unknown as Config;
}

function createServiceCollectionStub() {
    const scoped: Array<{ name: string; factory: unknown; disposer?: unknown }> = [];
    const singleton: Array<{ name: string; factory: unknown }> = [];

    const collection = {
        addScoped: (name: string, factory: unknown, disposer?: unknown) => {
            scoped.push({ name, factory, disposer });
        },
        addSingleton: (name: string, factory: unknown) => {
            singleton.push({ name, factory });
        },
    } as unknown as ServiceCollection;

    return { collection, scoped, singleton };
}

Deno.test('[Unit] - MongoDbServices - Atlas URI overrides legacy fields without adding a port', async () => {
    const config = createConfig({
        PERSISTENCE_MONGO_DB_URI:
            'mongodb+srv://portfolio:example@cluster.example.com/howestprime_ticketing?retryWrites=true&w=majority',
        PERSISTENCE_MONGO_DB_DIRECT_CONNECTION: 'false',
    });
    const client = MongoDbServices.createNativeMongoClient(config);
    assertEquals(client.options.srvHost, 'cluster.example.com');
    assertEquals(client.options.dbName, 'howestprime_ticketing');
    assertEquals(client.options.tls, true);
    assertEquals(client.options.directConnection, false);
    await client.close();
});

Deno.test('[Unit] - MongoDbServices - add/addMongoDbClient/addUnitOfWork/createNativeMongoClient - wires services', async () => {
    const config = createConfig({
        PERSISTENCE_MONGO_DB_PROTOCOL: 'mongodb',
        PERSISTENCE_MONGO_DB_HOST: 'localhost',
        PERSISTENCE_MONGO_DB_PORT: '40131',
        PERSISTENCE_MONGO_DB_NAME: 'howestprime-ticketing',
        PERSISTENCE_MONGO_DB_OPTIONS: 'authSource=admin',
        PERSISTENCE_MONGO_DB_USER: '',
        PERSISTENCE_MONGO_DB_PASS: '',
        PERSISTENCE_MONGO_DB_DIRECT_CONNECTION: 'true',
    });

    const { collection, scoped } = createServiceCollectionStub();
    MongoDbServices.add(config, collection, [MongoDbSuggestionRepository.name, MongoDbMovieRepository.name]);

    assertEquals(scoped.some((entry) => entry.name === MongoDbClient.name), true);
    assertEquals(scoped.some((entry) => entry.name === MongoDbUnitOfWork.name), true);

    const clientScoped = scoped.find((entry) => entry.name === MongoDbClient.name)?.factory as
        ((provider: ServiceProvider) => Promise<MongoDbClient>);
    const originalConnect = MongoClient.prototype.connect;
    MongoClient.prototype.connect = async function () {
        return this;
    };
    const nativeClient = await clientScoped({} as ServiceProvider);
    MongoClient.prototype.connect = originalConnect;
    assertEquals(nativeClient instanceof MongoDbClient, true);
    await (scoped.find((entry) => entry.name === MongoDbClient.name)?.disposer as (client: MongoDbClient) => Promise<void>)(nativeClient);

    const directClient = MongoDbServices.createNativeMongoClient(config);
    assertEquals(directClient.options.dbName, 'howestprime-ticketing');
    await directClient.close();
});

Deno.test('[Unit] - MongoDbServices - addUnitOfWork - registers repositories in unit of work', async () => {
    const config = createConfig({
        PERSISTENCE_MONGO_DB_PROTOCOL: 'mongodb',
        PERSISTENCE_MONGO_DB_HOST: 'localhost',
        PERSISTENCE_MONGO_DB_PORT: '40131',
        PERSISTENCE_MONGO_DB_NAME: 'howestprime-ticketing',
        PERSISTENCE_MONGO_DB_OPTIONS: 'authSource=admin',
        PERSISTENCE_MONGO_DB_USER: '',
        PERSISTENCE_MONGO_DB_PASS: '',
        PERSISTENCE_MONGO_DB_DIRECT_CONNECTION: 'true',
    });

    const { collection, scoped } = createServiceCollectionStub();
    MongoDbServices.addMongoDbClient(config, collection);
    MongoDbServices.addUnitOfWork(collection, [MongoDbSuggestionRepository.name, MongoDbMovieRepository.name]);

    const serviceFactory = scoped.find((entry) => entry.name === MongoDbUnitOfWork.name)?.factory as
        ((provider: ServiceProvider) => Promise<MongoDbUnitOfWork>);

    const mongoDbClient = {
        session: {
            startTransaction: () => {},
            commitTransaction: async () => {},
            abortTransaction: async () => {},
            inTransaction: () => false,
        },
    } as unknown as MongoDbClient;

    const provider = {
        getService: async (name: string) => {
            if (name === MongoDbClient.name) {
                return { value: mongoDbClient };
            }

            if (name === MongoDbSuggestionRepository.name || name === MongoDbMovieRepository.name) {
                return { value: { entityName: name } };
            }

            return { value: undefined };
        },
    } as unknown as ServiceProvider;

    const unitOfWork = await serviceFactory(provider);
    assertEquals((unitOfWork.getRepository(MongoDbSuggestionRepository.name) as any).entityName, MongoDbSuggestionRepository.name);
    assertEquals((unitOfWork.getRepository(MongoDbMovieRepository.name) as any).entityName, MongoDbMovieRepository.name);
});
