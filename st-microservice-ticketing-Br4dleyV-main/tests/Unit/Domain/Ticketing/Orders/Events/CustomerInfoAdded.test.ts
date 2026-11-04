import { assertEquals } from '@std/assert';

import { Customer, CustomerInfoAdded } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - CustomerInfoAdded - create - creates event with customer info', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com');
    const event = CustomerInfoAdded.create('order-123', customer);

    assertEquals(event.orderId, 'order-123');
    assertEquals(event.salutation, 'Ms.');
    assertEquals(event.firstName, 'Jane');
    assertEquals(event.lastName, 'Doe');
    assertEquals(event.email, 'jane.doe@example.com');
});

Deno.test('[Unit] - CustomerInfoAdded - create - sets occurredOn timestamp', () => {
    const customer = Customer.create('Mr.', 'John', 'Smith', 'john@example.com');
    const beforeCreation = new Date();

    const event = CustomerInfoAdded.create('order-456', customer);

    const afterCreation = new Date();
    assertEquals(event.occurredOn >= beforeCreation, true);
    assertEquals(event.occurredOn <= afterCreation, true);
});

Deno.test('[Unit] - CustomerInfoAdded - FQDN getter - returns correct FQDN', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com');
    const event = CustomerInfoAdded.create('order-789', customer);

    assertEquals(typeof event.FQDN, 'object');
    assertEquals(event.FQDN.value.includes('customerinfoadded'), true);
});

Deno.test('[Unit] - CustomerInfoAdded - orderId getter - returns order id', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Doe', 'jane.doe@example.com');
    const event = CustomerInfoAdded.create('order-abc', customer);

    assertEquals(event.orderId, 'order-abc');
});

Deno.test('[Unit] - CustomerInfoAdded - salutation getter - returns customer salutation', () => {
    const customer = Customer.create('Mx.', 'Alex', 'Johnson', 'alex@example.com');
    const event = CustomerInfoAdded.create('order-xyz', customer);

    assertEquals(event.salutation, 'Mx.');
});

Deno.test('[Unit] - CustomerInfoAdded - firstName getter - returns customer first name', () => {
    const customer = Customer.create('Mr.', 'Robert', 'Williams', 'robert@example.com');
    const event = CustomerInfoAdded.create('order-001', customer);

    assertEquals(event.firstName, 'Robert');
});

Deno.test('[Unit] - CustomerInfoAdded - lastName getter - returns customer last name', () => {
    const customer = Customer.create('Ms.', 'Patricia', 'Brown', 'patricia@example.com');
    const event = CustomerInfoAdded.create('order-002', customer);

    assertEquals(event.lastName, 'Brown');
});

Deno.test('[Unit] - CustomerInfoAdded - email getter - returns customer email', () => {
    const customer = Customer.create('Mr.', 'Michael', 'Davis', 'michael@example.com');
    const event = CustomerInfoAdded.create('order-003', customer);

    assertEquals(event.email, 'michael@example.com');
});

Deno.test('[Unit] - CustomerInfoAdded - create - with normalized customer - preserves normalized values', () => {
    const customer = Customer.create('  mr  ', '  john  ', '  doe  ', '  JOHN.DOE@EXAMPLE.COM  ');
    const event = CustomerInfoAdded.create('order-normalized', customer);

    assertEquals(event.salutation, 'Mr.');
    assertEquals(event.firstName, 'john');
    assertEquals(event.lastName, 'doe');
    assertEquals(event.email, 'john.doe@example.com');
});

Deno.test('[Unit] - CustomerInfoAdded - create - multiple events are independent', () => {
    const customer1 = Customer.create('Mr.', 'John', 'Smith', 'john@example.com');
    const customer2 = Customer.create('Ms.', 'Jane', 'Doe', 'jane@example.com');

    const event1 = CustomerInfoAdded.create('order-1', customer1);
    const event2 = CustomerInfoAdded.create('order-2', customer2);

    assertEquals(event1.orderId, 'order-1');
    assertEquals(event1.firstName, 'John');
    assertEquals(event2.orderId, 'order-2');
    assertEquals(event2.firstName, 'Jane');
});

Deno.test('[Unit] - CustomerInfoAdded - occurredOn - returns date type', () => {
    const customer = Customer.create('Mr.', 'Test', 'User', 'test@example.com');
    const event = CustomerInfoAdded.create('order-date-test', customer);

    assertEquals(event.occurredOn instanceof Date, true);
});

Deno.test('[Unit] - CustomerInfoAdded - create - with special characters in name', () => {
    const customer = Customer.create('Mr.', "O'Connell", "D'Angelo", 'test@example.com');
    const event = CustomerInfoAdded.create('order-special', customer);

    assertEquals(event.firstName, "O'Connell");
    assertEquals(event.lastName, "D'Angelo");
});

Deno.test('[Unit] - CustomerInfoAdded - getters work after multiple accesses', () => {
    const customer = Customer.create('Ms.', 'Sarah', 'Connor', 'sarah@example.com');
    const event = CustomerInfoAdded.create('order-multi', customer);

    // Access multiple times to ensure consistency
    const firstAccess = event.firstName;
    const secondAccess = event.firstName;
    const thirdAccess = event.firstName;

    assertEquals(firstAccess, 'Sarah');
    assertEquals(secondAccess, 'Sarah');
    assertEquals(thirdAccess, 'Sarah');
});

Deno.test('[Unit] - CustomerInfoAdded - FQDN_VALUE - is class constant', () => {
    const fqdnValue = CustomerInfoAdded.FQDN_VALUE;

    assertEquals(typeof fqdnValue, 'object');
    assertEquals(fqdnValue.value.includes('customerinfoadded'), true);
});
