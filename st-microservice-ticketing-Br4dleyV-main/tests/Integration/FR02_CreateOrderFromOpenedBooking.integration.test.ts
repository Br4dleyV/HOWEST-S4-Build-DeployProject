import { assertEquals } from '@std/assert';
import { MongoClient } from '@mongodb';

import type { Logger } from '@/Application/Ports/mod.ts';
import { SaveMovie } from '@/Application/Ticketing/Movies/mod.ts';
import { CreateOrderFromBooking } from '@/Application/Ticketing/Orders/mod.ts';
import {
    CreateOrderFromBookingController,
    SaveMovieController,
} from '@/Infrastructure/Messaging/LavinMQ/Controllers/mod.ts';
import { OrderId } from '@/Domain/Ticketing/Orders/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import {
    MongoDbMovieRepository,
    MovieDocumentMapper,
    MongoDbOrderRepository,
    OrderDocumentMapper,
} from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import { MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

const shouldRunIntegration = Deno.env.get('RUN_FR02_INTEGRATION_TESTS') === '1';

const logger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test({
    name: '[Integration] - FR02 - BookingOpened payload - creates open order with tickets in MongoDB',
    ignore: !shouldRunIntegration,
    sanitizeResources: false,
    sanitizeOps: false,
    async fn() {
        const dbName = 'howestprime-ticketing-fr02-it';
        const connectionString = MongoDbClient.createConnectionString(
            'mongodb',
            'localhost',
            '40131',
            'authSource=admin&directConnection=true',
            dbName,
            '',
            '',
        );

        const client = new MongoClient(connectionString, {
            directConnection: true,
        });
        await client.connect();

        const mongoDbClient = new MongoDbClient(client);
        const movieRepository = new MongoDbMovieRepository(mongoDbClient, new MovieDocumentMapper());
        const orderRepository = new MongoDbOrderRepository(mongoDbClient, new OrderDocumentMapper());

        const movieUnitOfWork = new MongoDbUnitOfWork(mongoDbClient.session);
        movieUnitOfWork.registerRepository(movieRepository);

        const orderUnitOfWork = new MongoDbUnitOfWork(mongoDbClient.session);
        orderUnitOfWork.registerRepository(movieRepository);
        orderUnitOfWork.registerRepository(orderRepository);

        const saveMovieUseCase = new SaveMovie(movieUnitOfWork, logger);
        const saveMovieController = new SaveMovieController(saveMovieUseCase);

        await saveMovieController.handle({
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            title: 'Example Movie',
            durationMinutes: 120,
            genres: ['Drama', 'Thriller'],
            posterUrl: 'https://example.com/poster.png',
            ageRating: '12+',
        } as never);

        const createOrderUseCase = new CreateOrderFromBooking(orderUnitOfWork, logger);
        const createOrderController = new CreateOrderFromBookingController(createOrderUseCase);

        await createOrderController.handle({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
            movieId: 'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
            room: 'Room A',
            showtime: '2026-05-20T19:30:00.000Z',
            standardVisitors: 2,
            discountedVisitors: 1,
            seatNumbers: [12, 13, 14],
        } as never);

        const collection = client.db(dbName).collection('orders');
        const savedOrderDocument = await collection.findOne({
            bookingId: '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        });

        assertEquals(savedOrderDocument !== null, true);

        const orderId = String(savedOrderDocument?._id);
        const stored = await orderRepository.byId(OrderId.create(orderId));
        const order = stored.getOrThrow();

        assertEquals(stored.isPresent, true);
        assertEquals(order.status.value, 'open');
        assertEquals(order.tickets.length, 3);

        const basePrice = order.tickets[0]?.movieInfo.price.cents ?? 0;
        const discountedPrice = Math.round(basePrice * 0.9);
        assertEquals(order.price.cents, basePrice + basePrice + discountedPrice);

        await client.db(dbName).dropDatabase();
        await client.close();
    },
});
