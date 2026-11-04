import { ServiceCollection, ServiceProvider } from '@domaincrafters/di';

import {
    CreateSuggestionUseCase,
    type CreateSuggestionUseCaseInput,
    GetSuggestionByIdQueryUseCase,
    type GetSuggestionByIdQueryUseCaseInput,
    ListSuggestionsQueryUseCase,
    WhenSuggestionCreatedConsoleLogSuggestion,
} from '@/Application/Ticketing/Suggestions/mod.ts';
import { SaveMovie, SaveMovieInput } from '@/Application/Ticketing/Movies/mod.ts';
import {
    CreateOrderFromBooking,
    type CreateOrderFromBookingInput,
    AddCustomerToOrder,
    type AddCustomerToOrderInput,
    MarkOrderAsPaid,
    type MarkOrderAsPaidInput,
    CancelOrder,
    type CancelOrderInput,
    ReleaseTickets,
    type ReleaseTicketsInput,
    WhenOrderPaidThenReleaseTickets,
    GetOrderByBookingIdQueryUseCase,
    type GetOrderByBookingIdQueryUseCaseInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import {
    PayOrder,
    type PayOrderInput,
    WhenPaymentSucceededThenMarkOrderAsPaid,
    WhenPaymentFailedThenCancelOrder,
} from '@/Application/Ticketing/Payments/mod.ts';
import { domainEventPolicies } from '@/Application/mod.ts';
import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type { PaymentService } from '@/Application/Ports/Gateways/mod.ts';
import type {
    OrderData,
    SuggestionByIdReadModel,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { DomainEventRegistry } from '@/Infrastructure/Events/Shared/mod.ts';
import { PolicyDomainEventListener } from '@/Infrastructure/Events/mod.ts';
import {
    MongoDbGetOrderByBookingIdQuery,
    MongoDbGetSuggestionByIdQuery,
    MongoDbListSuggestionsQuery,
} from '@/Infrastructure/Persistence/MongoDb/Queries/mod.ts';
import { MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Config, ConsoleLogger } from '@/Infrastructure/Shared/mod.ts';
import { Module } from '@/Main/Modules/Shared/mod.ts';
import { OnlinePaymentService } from '@/Infrastructure/Payment/mod.ts';

export class Application implements Module {
    add(serviceCollection: ServiceCollection, _config: Config): void {
        console.log('Application module added');
        this.addUseCases(serviceCollection);
        this.addPolicies(serviceCollection);

        serviceCollection.addScoped(
            OnlinePaymentService.name,
            () => Promise.resolve(new OnlinePaymentService()),
        );
    }

    private addUseCases(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            CreateSuggestionUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<CreateSuggestionUseCaseInput, string> =
                    new CreateSuggestionUseCase(
                        unitOfWork,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            ListSuggestionsQueryUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbListSuggestionsQuery>(
                    MongoDbListSuggestionsQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<void, SuggestionListItemReadModel[]> =
                    new ListSuggestionsQueryUseCase(
                        query,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            GetSuggestionByIdQueryUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbGetSuggestionByIdQuery>(
                    MongoDbGetSuggestionByIdQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<
                    GetSuggestionByIdQueryUseCaseInput,
                    SuggestionByIdReadModel
                > = new GetSuggestionByIdQueryUseCase(
                    query,
                    logger,
                );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            GetOrderByBookingIdQueryUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbGetOrderByBookingIdQuery>(
                    MongoDbGetOrderByBookingIdQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<GetOrderByBookingIdQueryUseCaseInput, OrderData> =
                    new GetOrderByBookingIdQueryUseCase(
                        query,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            SaveMovie.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new SaveMovie(unitOfWork, logger) as UseCase<SaveMovieInput, void>;
            },
        );

        serviceCollection.addScoped(
            CreateOrderFromBooking.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new CreateOrderFromBooking(unitOfWork, logger) as UseCase<
                    CreateOrderFromBookingInput,
                    string
                >;
            },
        );

        serviceCollection.addScoped(
            AddCustomerToOrder.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new AddCustomerToOrder(unitOfWork, logger) as UseCase<
                    AddCustomerToOrderInput,
                    string
                >;
            },
        );

        serviceCollection.addScoped(
            PayOrder.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const paymentService = (await serviceProvider.getService<PaymentService>(
                    OnlinePaymentService.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new PayOrder(unitOfWork, paymentService, logger) as UseCase<
                    PayOrderInput,
                    string
                >;
            },
        );

        serviceCollection.addScoped(
            MarkOrderAsPaid.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new MarkOrderAsPaid(unitOfWork, logger) as UseCase<
                    MarkOrderAsPaidInput,
                    void
                >;
            },
        );

        serviceCollection.addScoped(
            CancelOrder.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new CancelOrder(unitOfWork, logger) as UseCase<
                    CancelOrderInput,
                    void
                >;
            },
        );

        serviceCollection.addScoped(
            ReleaseTickets.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                return new ReleaseTickets(unitOfWork, logger) as UseCase<
                    ReleaseTicketsInput,
                    void
                >;
            },
        );
    }

    private addPolicies(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            WhenSuggestionCreatedConsoleLogSuggestion.name,
            async (serviceProvider: ServiceProvider) => {
                const logger = (await serviceProvider.getService<Logger>(
                    ConsoleLogger.name,
                )).getOrThrow();

                return new WhenSuggestionCreatedConsoleLogSuggestion(logger);
            },
        );

        serviceCollection.addScoped(
            WhenPaymentSucceededThenMarkOrderAsPaid.name,
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new WhenPaymentSucceededThenMarkOrderAsPaid(serviceProvider));
            },
        );

        serviceCollection.addScoped(
            WhenPaymentFailedThenCancelOrder.name,
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new WhenPaymentFailedThenCancelOrder(serviceProvider));
            },
        );

        serviceCollection.addScoped(
            WhenOrderPaidThenReleaseTickets.name,
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new WhenOrderPaidThenReleaseTickets(serviceProvider));
            },
        );

        serviceCollection.addScoped(
            WhenPaymentSucceededThenMarkOrderAsPaid.name,
            (serviceProvider: ServiceProvider) => {
                return Promise.resolve(new WhenPaymentSucceededThenMarkOrderAsPaid(serviceProvider));
            },
        );
    }

    async use(serviceProvider: ServiceProvider): Promise<void> {
        console.log('Application module use - Wiring policyregistry');

        // Get event bus from DI container
        const eventListener = (await serviceProvider.getService<PolicyDomainEventListener>(
            'PolicyDomainEventListener',
        ))
            .getOrThrow();

        // Create policy registry (Infrastructure)
        const policyregistry = new DomainEventRegistry([eventListener]);

        console.log(
            'Application module use - Registering policies from Application layer mapping',
            domainEventPolicies,
        );

        // Register policies from Application layer mapping
        // Policy instances are NOT resolved here - the EventBus will resolve them
        // with a fresh scope when handling each event
        policyregistry.registerFromMapping(domainEventPolicies);

        // Subscribe all policyregistry to event bus
        await policyregistry.subscribeAll();
    }

    static create(): Module {
        return new Application();
    }
}
