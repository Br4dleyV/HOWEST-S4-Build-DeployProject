import type { ConsumerContext } from '../AmqpBrokerConfigurator.ts';

export interface AmqpMessageProcessor {
    process(consumerContext: ConsumerContext): Promise<void>;
}
