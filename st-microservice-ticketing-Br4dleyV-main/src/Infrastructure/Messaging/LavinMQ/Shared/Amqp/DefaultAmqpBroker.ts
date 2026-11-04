import { AMQPChannel, AMQPClient, AMQPMessage, type QueueOk } from '@cloudamqp/amqp-client';
import { IllegalStateException } from '@domaincrafters/std';
import type { AmqpBroker } from './AmqpBroker.ts';
import type { ConsumerContext } from './AmqpBrokerConfigurator.ts';
import type { AmqpMessageProcessor } from './MessageProcessors/AmqpMessageProcessor.ts';

export interface Exchange {
    name: string;
    type: string;
}

export class ConsumerConfig {
    readonly OperationId: string;
    readonly ExchangeName: string;
    readonly Event: string;
    readonly BoundedContext: string;

    constructor(
        config: {
            OperationId: string;
            ExchangeName: string;
            Event: string;
            BoundedContext: string;
        },
    ) {
        this.OperationId = config.OperationId;
        this.ExchangeName = config.ExchangeName;
        this.Event = config.Event;
        this.BoundedContext = config.BoundedContext;
    }
}

export interface PublisherConfig {
    publisher: string;
    exchange: string;
    events: string[];
}

export interface BrokerConfig {
    host: string;
    exchanges: Exchange[];
}

export class DefaultAmqpBroker implements AmqpBroker {
    private _channel: AMQPChannel | null;
    private readonly _exchanges: Exchange[];
    private readonly _host: string;
    private readonly _messageProcessors: Array<AmqpMessageProcessor> = [];

    static create(config: BrokerConfig): DefaultAmqpBroker {
        const host = config.host;
        const exchanges: Exchange[] = config.exchanges;

        return new DefaultAmqpBroker(host, exchanges);
    }

    async connect(): Promise<void> {
        console.log('Connecting to AMQP');
        const amqp = new AMQPClient(this._host);
        try {
            const connection = await amqp.connect();
            this._channel = await connection.channel();

            for (const exchange of this._exchanges) {
                await this._channel.exchangeDeclare(
                    exchange.name,
                    exchange.type,
                    {
                        autoDelete: true,
                        durable: false,
                        internal: false,
                        passive: false,
                    },
                );
            }

            console.log('Connected to AMQP');
        } catch (error) {
            console.error('AMQP connection error:', error);
            throw new IllegalStateException('Could not establish connection to AMQP Broker');
        }
    }

    async stop(): Promise<void> {
        if (this._channel) {
            try {
                await this._channel.close();
                await this._channel.connection.close();
                console.log('Connection to AMQP Broker closed');
            } catch (_error) {
                throw new IllegalStateException('Error closing AMQP channel or connection');
            }
        }
    }

    async publishOnTopic(exchange: string, routingKey: string, message: string): Promise<void> {
        this.validateChannel();
        await this._channel!.basicPublish(exchange, routingKey, message, {
            contentType: 'application/json',
        });
    }

    async consumeFromTopic(
        consumerConfig: ConsumerConfig,
    ): Promise<void> {
        this.ensureValidExchange(consumerConfig.ExchangeName);
        const queueName = this.buildQueueName(consumerConfig);

        const queueOk: QueueOk | undefined = await this._channel?.queueDeclare(
            queueName,
            { durable: true, autoDelete: false },
        );

        if (queueOk === undefined) {
            throw new Error('Queue not created');
        }

        const declaredQueueName = queueOk.name;

        console.info(
            `Binding queue ${declaredQueueName} to exchange ${consumerConfig.ExchangeName} with routing key ${consumerConfig.Event}`,
        );
        console.info(consumerConfig);

        await this._channel?.queueBind(
            declaredQueueName,
            consumerConfig.ExchangeName,
            consumerConfig.Event,
        );

        await this._channel!.basicConsume(
            declaredQueueName,
            { noAck: true },
            async (data: AMQPMessage) => {
                const ctx: ConsumerContext = {
                    operationId: consumerConfig.OperationId,
                    exchangeName: consumerConfig.ExchangeName,
                    eventName: consumerConfig.Event,
                    message: data,
                };

                try {
                    for (const processor of this._messageProcessors) {
                        await processor.process(ctx);
                    }
                } catch (e) {
                    console.error('Error parsing message body as JSON:', e);
                }
            },
        );
    }

    addMessageProcessor(messageProcessor: AmqpMessageProcessor): this {
        this._messageProcessors.push(messageProcessor);
        return this;
    }

    private validateChannel(): void {
        if (!this.isChannelReady()) {
            throw new IllegalStateException('Channel is not connected');
        }
    }

    private ensureValidExchange(exchangeName: string) {
        if (!this._exchanges.some(({ name }) => name === exchangeName)) {
            throw new IllegalStateException(`Exchange ${exchangeName} not found`);
        }
    }

    private buildQueueName(consumerConfig: ConsumerConfig): string {
        return `${consumerConfig.ExchangeName}.${consumerConfig.BoundedContext}.${consumerConfig.OperationId}`;
    }

    private isChannelReady(): boolean {
        return this._channel !== null;
    }

    private constructor(host: string, exchanges: Exchange[]) {
        this._host = host;
        this._exchanges = exchanges;
        this._channel = null;
    }
}
