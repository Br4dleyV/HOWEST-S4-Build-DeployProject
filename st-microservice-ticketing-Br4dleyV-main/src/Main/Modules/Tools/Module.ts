import { ServiceCollection, ServiceProvider } from '@domaincrafters/di';
import { Config } from '@/Infrastructure/Shared/mod.ts';

import { ConsoleLogger } from '@/Infrastructure/Shared/ConsoleLogger.ts';
import { Module } from '../Shared/mod.ts';

export class Tools implements Module {
    add(serviceCollection: ServiceCollection, _config: Config): void {
        serviceCollection.addSingleton(
            ConsoleLogger.name,
            (_serviceProvider: ServiceProvider) => {
                return Promise.resolve(new ConsoleLogger());
            },
        );
    }

    use(_serviceProvider: ServiceProvider): Promise<void> {
        return Promise.resolve();
    }

    static create(): Module {
        return new Tools();
    }
}
