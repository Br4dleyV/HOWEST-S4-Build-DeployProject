import { ServiceCollection, ServiceProvider } from '@domaincrafters/di';

import { Config } from '@/Infrastructure/Shared/mod.ts';
import { Module } from '@/Main/Modules/Shared/mod.ts';

import {
    InMemoryDomainEventPublisher,
    PolicyDomainEventListener,
} from '@/Infrastructure/Events/mod.ts';
import {
    AmqpBroker,
    AmqpBrokerConfigurator,
    AmqpServices,
    AmqpTopicPublisher,
} from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { AmqpControllerFactory } from './AmqpControllerFactory.ts';

export class Events implements Module {
    add(serviceCollection: ServiceCollection, config: Config): void {
        this.addListeners(serviceCollection, config);
        this.addPublishers(serviceCollection, config);
        this.addMessaging(serviceCollection, config);
    }

    private addPublishers(serviceCollection: ServiceCollection, _config: Config) {
        serviceCollection.addSingleton(
            'InMemoryDomainEventPublisher',
            async (serviceProvider: ServiceProvider) => {
                const policyDomainEventListener =
                    (await serviceProvider.getService<PolicyDomainEventListener>(
                        'PolicyDomainEventListener',
                    )).getOrThrow();

                return new InMemoryDomainEventPublisher([policyDomainEventListener]);
            },
        );
    }

    private addListeners(serviceCollection: ServiceCollection, _config: Config) {
        serviceCollection.addSingleton(
            'PolicyDomainEventListener',
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new PolicyDomainEventListener(serviceProvider, 5000));
            },
        );
    }

    private addMessaging(serviceCollection: ServiceCollection, config: Config): void {
        AmqpServices.add(serviceCollection, config);

        serviceCollection.addScoped<AmqpControllerFactory>(
            'amqpControllerFactory',
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new AmqpControllerFactory(serviceProvider));
            },
        );
    }

    async use(serviceProvider: ServiceProvider): Promise<void> {
        await this.connectToAmqpBrokerAndRegisterConsumers(serviceProvider);
        await this.wireAmqpPublishersToDomainEventBus(serviceProvider);
    }

    private async connectToAmqpBrokerAndRegisterConsumers(
        serviceProvider: ServiceProvider,
    ): Promise<void> {
        const amqpBroker = (await serviceProvider.getService<AmqpBroker>('amqpBroker'))
            .getOrThrow();

        await amqpBroker.connect();

        const amqpBrokerConfigurator =
            (await serviceProvider.getService<AmqpBrokerConfigurator>('amqpBrokerConfigurator'))
                .getOrThrow();

        await amqpBrokerConfigurator.registerAmqpTopicConsumers(amqpBroker);
    }

    private async wireAmqpPublishersToDomainEventBus(
        serviceProvider: ServiceProvider,
    ): Promise<void> {
        const publishers =
            (await serviceProvider.getService<Array<AmqpTopicPublisher>>('amqpTopicPublishers'))
                .getOrThrow();

        const eventPublisher = (await serviceProvider.getService<InMemoryDomainEventPublisher>(
            'InMemoryDomainEventPublisher',
        )).getOrThrow();

        for (const publisher of publishers) {
            eventPublisher.registerListener(publisher);
        }
    }

    static create(): Module {
        return new Events();
    }
}
