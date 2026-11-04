import type { ConsumerConfig } from './DefaultAmqpBroker.ts';
import type { AmqpMessageProcessor } from './MessageProcessors/AmqpMessageProcessor.ts';

export interface AmqpBroker {
    connect(): Promise<void>;

    stop(): Promise<void>;

    publishOnTopic(
        exchange: string,
        routingKey: string,
        message: string,
    ): Promise<void>;

    consumeFromTopic(
        consumerConfig: ConsumerConfig,
    ): Promise<void>;

    addMessageProcessor(messageProcessor: AmqpMessageProcessor): this;
}
