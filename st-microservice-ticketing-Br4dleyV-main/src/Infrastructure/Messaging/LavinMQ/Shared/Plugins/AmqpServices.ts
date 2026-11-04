import {
    ServiceCollection,
    ServiceDisposer,
    ServiceFactory,
    ServiceProvider,
} from '@domaincrafters/di';
import type { AmqpTopicPublisher } from '../Amqp/AmqpTopicPublisher.ts';
import { Config } from '@/Infrastructure/Shared/mod.ts';
import type { AmqpBroker } from '../Amqp/AmqpBroker.ts';
import { AmqpBrokerConfigurator } from '../Amqp/AmqpBrokerConfigurator.ts';
import { MessageProcessorWithDI } from './MessageProcessorWithDI.ts';

export class AmqpServices {
    static add(serviceCollection: ServiceCollection, config: Config): void {
        AmqpServices
            .addAmqpBrokerConfigurator(serviceCollection, config)
            .addMessageBroker(serviceCollection)
            .addAmqpTopicPublishers(serviceCollection);
    }

    private static addAmqpBrokerConfigurator(
        serviceCollection: ServiceCollection,
        config: Config,
    ): typeof AmqpServices {
        const amqpBrokerConfiguratorServiceFactory: ServiceFactory = async () => {
            const amqpBrokerConfigurator: AmqpBrokerConfigurator = await AmqpBrokerConfigurator
                .create(
                    config.get('MESSAGING_LAVINMQ_ASYNCAPI_PATH'),
                    config.get('MESSAGING_LAVINMQ_HOSTNAME'),
                    config.get('MESSAGING_LAVINMQ_PORT'),
                    config.get('MESSAGING_LAVINMQ_VHOST'),
                    config.get('MESSAGING_LAVINMQ_USER'),
                    config.get('MESSAGING_LAVINMQ_PASS'),
                );
            return Promise.resolve(amqpBrokerConfigurator);
        };

        serviceCollection.addSingleton<AmqpBrokerConfigurator>(
            'amqpBrokerConfigurator',
            amqpBrokerConfiguratorServiceFactory,
        );

        return this;
    }

    private static addMessageBroker(serviceCollection: ServiceCollection): typeof AmqpServices {
        const amqpBrokerServiceFactory: ServiceFactory = async (
            sp: ServiceProvider,
        ) => {
            const amqpBroker: AmqpBroker = (await this.configurator(sp)).createMessageBroker();
            amqpBroker.addMessageProcessor(new MessageProcessorWithDI(sp));
            return Promise.resolve(amqpBroker);
        };

        const amqpBrokerDisposer: ServiceDisposer<AmqpBroker> = (broker: AmqpBroker) => {
            console.log('Disposing AmqpBroker');
            return Promise.resolve(broker.stop());
        };

        serviceCollection.addSingleton<AmqpBroker>(
            'amqpBroker',
            amqpBrokerServiceFactory,
            amqpBrokerDisposer,
        );

        return this;
    }

    private static addAmqpTopicPublishers(
        serviceCollection: ServiceCollection,
    ): typeof AmqpServices {
        const amqpTopicPublishersServiceFactory: ServiceFactory = async (serviceProvider) => {
            const amqpBroker: AmqpBroker =
                (await serviceProvider.getService<AmqpBroker>('amqpBroker')).value;

            return (await this.configurator(serviceProvider)).registerAmqpTopicPublishers(
                amqpBroker,
            );
        };

        serviceCollection.addSingleton<Array<AmqpTopicPublisher>>(
            'amqpTopicPublishers',
            amqpTopicPublishersServiceFactory,
        );

        return this;
    }

    private static async configurator(
        serviceProvider: ServiceProvider,
    ): Promise<AmqpBrokerConfigurator> {
        return (await serviceProvider.getService<AmqpBrokerConfigurator>('amqpBrokerConfigurator'))
            .getOrThrow();
    }
}
