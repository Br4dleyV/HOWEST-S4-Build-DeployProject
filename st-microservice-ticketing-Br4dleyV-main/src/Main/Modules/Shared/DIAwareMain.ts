import {
    DIServiceCollection,
    DIServiceProvider,
    type ServiceCollection,
    type ServiceProvider,
} from '@domaincrafters/di';
import { Config } from '@/Infrastructure/Shared/mod.ts';
import type { Module } from './mod.ts';

export abstract class DIAwareMain {
    private readonly _serviceProvider: ServiceProvider;
    private readonly _serviceCollection: ServiceCollection;
    private readonly _config: Config;

    constructor(
        serviceCollection: ServiceCollection = DIServiceCollection.create(),
        serviceProvider: ServiceProvider = DIServiceProvider.create(serviceCollection),
        config: Config = Config.create(),
    ) {
        this._serviceProvider = serviceProvider;
        this._serviceCollection = serviceCollection;
        this._config = config;
    }

    async load(modules: Module[]): Promise<DIAwareMain> {
        modules.forEach((module) => module.add(this._serviceCollection, this._config));

        for (const module of modules) {
            await module.use(this._serviceProvider);
        }
        return this;
    }

    public get serviceProvider(): ServiceProvider {
        if (!this._serviceProvider) {
            throw new Error('Service provider is not initialized');
        }

        return this._serviceProvider;
    }

    protected get serviceCollection(): ServiceCollection {
        if (!this._serviceCollection) {
            throw new Error('Service collection is not initialized');
        }

        return this._serviceCollection;
    }

    public get config(): Config {
        if (!this._config) {
            throw new Error('Config is not initialized');
        }

        return this._config;
    }
}
