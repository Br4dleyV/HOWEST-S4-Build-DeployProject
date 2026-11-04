import type { ServiceCollection, ServiceProvider } from '@domaincrafters/di';
import { Config } from '@/Infrastructure/Shared/mod.ts';

export interface Module {
    add(serviceCollection: ServiceCollection, config: Config): void;
    use(serviceProvider: ServiceProvider): Promise<void>;
}
