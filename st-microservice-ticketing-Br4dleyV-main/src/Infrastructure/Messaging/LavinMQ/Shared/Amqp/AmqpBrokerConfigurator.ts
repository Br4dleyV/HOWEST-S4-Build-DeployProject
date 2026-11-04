import { AMQPMessage } from '@cloudamqp/amqp-client';
import { ParseOutput, Parser } from '@asyncapi/parser';
import { IllegalStateException } from '@domaincrafters/std';
import type { AmqpBroker } from './AmqpBroker.ts';
import {
    BrokerConfig,
    ConsumerConfig,
    DefaultAmqpBroker,
    Exchange,
    PublisherConfig,
} from './DefaultAmqpBroker.ts';
import { AmqpTopicPublisher } from './AmqpTopicPublisher.ts';

export interface ConsumerContext {
    exchangeName: string;
    eventName: string;
    operationId: string;
    message?: AMQPMessage;
    state?: unknown;
}

export type messageHandlerBuilder = (ctx: ConsumerContext) => (message: unknown) => Promise<void>;

export class AmqpBrokerConfigurator {
    private readonly _asyncApiSpecification: ParseOutput;
    private readonly _host: string;

    static async create(
        asyncApiSpecificationPath: string,
        hostname: string,
        port: string,
        virtualHost: string,
        username: string,
        password: string,
    ): Promise<AmqpBrokerConfigurator> {
        const host = `amqp://${username}:${password}@${hostname}:${port}/${virtualHost}`;
        const asyncApiSpecification: ParseOutput = await this.parseAsyncAPIDocument(
            asyncApiSpecificationPath,
        );

        return new AmqpBrokerConfigurator(asyncApiSpecification, host);
    }

    createMessageBroker(): AmqpBroker {
        const brokerConfig = this.findBrokerConfig();
        return DefaultAmqpBroker.create(brokerConfig);
    }

    async registerAmqpTopicConsumers(amqpBroker: AmqpBroker): Promise<void> {
        const consumerConfigs: ConsumerConfig[] = this
            .findConsumerConfig();

        for (const consumerConfig of consumerConfigs) {
            await amqpBroker.consumeFromTopic(consumerConfig);
            console.log(
                'Registered consumer on exchange',
                consumerConfig.ExchangeName,
                'for event',
                consumerConfig.Event,
                'with operationId',
                consumerConfig.OperationId,
            );
        }
    }

    registerAmqpTopicPublishers(amqpBroker: AmqpBroker): Array<AmqpTopicPublisher> {
        return this
            .findPublisherConfig('AmqpTopicPublisher')
            .map((publisherConfig) =>
                AmqpTopicPublisher.create(
                    amqpBroker,
                    publisherConfig.exchange,
                    publisherConfig.events,
                )
            );
    }

    private findConsumerConfig(): Array<ConsumerConfig> {
        const boundedContext = this.findBoundedContext();

        return Array.from(this.uniqueExchanges())
            .map((exchange) =>
                this._asyncApiSpecification.document
                    ?.allOperations()
                    .filterByReceive()
                    .filter((operation) =>
                        operation.json().channel.bindings.amqp.exchange.name === exchange.name
                    )
            )
            .flat()
            .map((operation) => {
                return new ConsumerConfig({
                    OperationId: operation?.id() ?? '',
                    ExchangeName: operation?.json().channel.bindings.amqp.exchange.name ?? '',
                    Event: operation?.json().channel.bindings.amqp.exchange.routingKey ?? '',
                    BoundedContext: boundedContext,
                });
            });
    }

    private findBoundedContext(): string {
        const info = this._asyncApiSpecification.document?.json()?.info as
            | Record<string, unknown>
            | undefined;
        const metadata = info?.['x-metadata'] as Record<string, unknown> | undefined;
        const boundedContext = metadata?.BoundedContext;

        return typeof boundedContext === 'string' ? boundedContext : '';
    }

    private findPublisherConfig(publisher: string): Array<PublisherConfig> {
        return Array.from(this.uniqueExchanges()).map((exchange) => {
            return {
                exchange: exchange.name,
                publisher,
                events: this._asyncApiSpecification.document
                    ?.allChannels()
                    .filterBySend()
                    .filter((channel) =>
                        channel.json().bindings.amqp.exchange.name === exchange.name
                    )
                    .map((channel) => channel.json().bindings.amqp.exchange.routingKey) || [],
            };
        });
    }

    private findBrokerConfig(): BrokerConfig {
        const brokerConfig: BrokerConfig = {
            host: this._host,
            exchanges: Array.from(this.uniqueExchanges()),
        };

        return brokerConfig;
    }

    private uniqueExchanges(): Set<Exchange> {
        const uniqueExchangesJson: Set<string> = new Set(
            this._asyncApiSpecification.document
                ?.allChannels()
                .all()
                .map((channel) => {
                    return JSON.stringify({
                        name: channel.json().bindings.amqp.exchange.name,
                        type: channel.json().bindings.amqp.exchange.type,
                    });
                }),
        );

        return new Set(
            Array.from(uniqueExchangesJson).map((exchange) => JSON.parse(exchange) as Exchange),
        );
    }

    private static async parseAsyncAPIDocument(filePath: string): Promise<ParseOutput> {
        const errorBag: string[] = [];

        try {
            const fileContent = await Deno.readTextFile(filePath);
            const parser: Parser = new Parser();

            (await parser.validate(fileContent))
                .forEach((diagnostic) => errorBag.push(diagnostic.message));

            if (errorBag.length > 0) {
                throw new IllegalStateException('AsyncAPI document is invalid');
            }

            return await parser.parse(fileContent);
        } catch (e) {
            const message: string =
                `Parsing AsyncAPI document failed: ${e}\n Diagnostics: ${errorBag}`;
            throw new IllegalStateException(message);
        }
    }

    private constructor(
        asyncApiSpecification: ParseOutput,
        host: string,
    ) {
        this._asyncApiSpecification = asyncApiSpecification;
        this._host = host;
    }
}
