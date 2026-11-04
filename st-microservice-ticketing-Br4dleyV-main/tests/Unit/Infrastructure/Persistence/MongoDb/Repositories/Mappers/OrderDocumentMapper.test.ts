import { assertEquals } from '@std/assert';

import { Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { Customer, Order } from '@/Domain/Ticketing/Orders/mod.ts';
import { OrderDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';

Deno.test('[Unit] - OrderDocumentMapper - toDocument and reconstitute - round trips order with customer', () => {
    const mapper = new OrderDocumentMapper();
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );
    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    order.acceptTerms();
    order.addCustomer(Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com'));

    const document = mapper.toDocument(order);
    const reconstituted = mapper.reconstitute(document);

    assertEquals(document._id, order.id.value);
    assertEquals(document.bookingId, '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d');
    assertEquals(document.customer?.firstName, 'Jane');
    assertEquals(reconstituted.id.value, order.id.value);
    assertEquals(reconstituted.bookingId.value, order.bookingId.value);
    assertEquals(reconstituted.status.value, order.status.value);
    assertEquals(reconstituted.tickets.length, order.tickets.length);
    assertEquals(reconstituted.price.cents, order.price.cents);
    assertEquals(reconstituted.customer?.email.value, 'jane.doe@example.com');
});

Deno.test('[Unit] - OrderDocumentMapper - reconstitute - uses fallback id field', () => {
    const mapper = new OrderDocumentMapper();
    const movie = Movie.create(
        'b3f9a2d3-6f1c-4e0a-9a1d-123456789abc',
        'Example Movie',
        120,
        ['Drama'],
        'https://example.com/poster.png',
        '12+',
    );
    const order = Order.createFromBooking(
        '32d33834-6fd6-4eb6-b3aa-9b5f39001c5d',
        movie,
        'Room A',
        new Date('2026-05-20T19:30:00.000Z'),
        2,
        1,
        [12, 13, 14],
    );

    const document = mapper.toDocument(order);
    
    // Remove _id and set id instead to test fallback
    delete document._id;
    document.id = order.id.value;
    
    const reconstituted = mapper.reconstitute(document);

    assertEquals(reconstituted.id.value, order.id.value);
    assertEquals(reconstituted.bookingId.value, order.bookingId.value);
    assertEquals(reconstituted.status.value, order.status.value);
    assertEquals(reconstituted.tickets.length, order.tickets.length);
    assertEquals(reconstituted.price.cents, order.price.cents);
});
