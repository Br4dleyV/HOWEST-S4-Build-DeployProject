import type { ConsumerContext } from './AmqpBrokerConfigurator.ts';
import type { AmqpController } from '../AmqpController.ts';

export interface ControllerFactory {
    create(consumerContext: ConsumerContext): Promise<AmqpController<unknown>>;
}
