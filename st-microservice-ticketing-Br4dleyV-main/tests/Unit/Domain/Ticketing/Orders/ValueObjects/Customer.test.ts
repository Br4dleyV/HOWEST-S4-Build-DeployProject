import { assertEquals, assertThrows } from '@std/assert';

import { Customer, CustomerSalutations } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - Customer - create - valid input normalizes and returns value object', () => {
    const customer = Customer.create(' Ms. ', ' Jane ', ' Doe ', ' JANE.DOE@EXAMPLE.COM ');

    assertEquals(customer.salutation, 'Ms.');
    assertEquals(customer.firstName, 'Jane');
    assertEquals(customer.lastName, 'Doe');
    assertEquals(customer.email.value, 'jane.doe@example.com');
});

Deno.test('[Unit] - Customer - create - invalid salutation throws', () => {
    assertThrows(
        () => Customer.create('Dr.', 'Jane', 'Doe', 'jane.doe@example.com'),
        Error,
    );
});

Deno.test('[Unit] - Customer - create - empty first name throws', () => {
    assertThrows(
        () => Customer.create('Ms.', '   ', 'Doe', 'jane.doe@example.com'),
        Error,
    );
});

Deno.test('[Unit] - Customer - create - empty last name throws', () => {
    assertThrows(
        () => Customer.create('Ms.', 'Jane', '   ', 'jane.doe@example.com'),
        Error,
    );
});

Deno.test('[Unit] - Customer - reconstitute - restores customer', () => {
    const customer = Customer.reconstitute({
        salutation: CustomerSalutations[0],
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
    });

    assertEquals(customer.salutation, 'Mr.');
    assertEquals(customer.email.value, 'jane.doe@example.com');
});

Deno.test('[Unit] - Customer - create - salutation lowercase without dot - normalizes to standard form', () => {
    const customer = Customer.create('mr', 'John', 'Smith', 'john@example.com');

    assertEquals(customer.salutation, 'Mr.');
});

Deno.test('[Unit] - Customer - create - salutation uppercase without dot - normalizes to standard form', () => {
    const customer = Customer.create('MS', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer.salutation, 'Ms.');
});

Deno.test('[Unit] - Customer - create - salutation Mx lowercase without dot - normalizes to standard form', () => {
    const customer = Customer.create('mx', 'Alex', 'Smith', 'alex@example.com');

    assertEquals(customer.salutation, 'Mx.');
});

Deno.test('[Unit] - Customer - create - salutation with trailing spaces - normalizes correctly', () => {
    const customer = Customer.create('Mr. ', 'John', 'Doe', 'john@example.com');

    assertEquals(customer.salutation, 'Mr.');
    assertEquals(customer.firstName, 'John');
});

Deno.test('[Unit] - Customer - create - all fields with excess whitespace - normalizes all', () => {
    const customer = Customer.create('  Ms.  ', '  Jane  ', '  Smith  ', '  jane@example.com  ');

    assertEquals(customer.salutation, 'Ms.');
    assertEquals(customer.firstName, 'Jane');
    assertEquals(customer.lastName, 'Smith');
    assertEquals(customer.email.value, 'jane@example.com');
});

Deno.test('[Unit] - Customer - equals - same values - returns true', () => {
    const customer1 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');
    const customer2 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer1.equals(customer2), true);
});

Deno.test('[Unit] - Customer - equals - different salutation - returns false', () => {
    const customer1 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');
    const customer2 = Customer.create('Mr.', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer1.equals(customer2), false);
});

Deno.test('[Unit] - Customer - equals - different first name - returns false', () => {
    const customer1 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');
    const customer2 = Customer.create('Ms.', 'John', 'Smith', 'jane@example.com');

    assertEquals(customer1.equals(customer2), false);
});

Deno.test('[Unit] - Customer - equals - different last name - returns false', () => {
    const customer1 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');
    const customer2 = Customer.create('Ms.', 'Jane', 'Doe', 'jane@example.com');

    assertEquals(customer1.equals(customer2), false);
});

Deno.test('[Unit] - Customer - equals - different email - returns false', () => {
    const customer1 = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');
    const customer2 = Customer.create('Ms.', 'Jane', 'Smith', 'john@example.com');

    assertEquals(customer1.equals(customer2), false);
});

Deno.test('[Unit] - Customer - equals - null customer - returns false', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer.equals(null as any), false);
});

Deno.test('[Unit] - Customer - equals - undefined customer - returns false', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer.equals(undefined as any), false);
});

Deno.test('[Unit] - Customer - create - Mr. salutation - creates successfully', () => {
    const customer = Customer.create('Mr.', 'John', 'Doe', 'john@example.com');

    assertEquals(customer.salutation, 'Mr.');
});

Deno.test('[Unit] - Customer - create - Ms. salutation - creates successfully', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Doe', 'jane@example.com');

    assertEquals(customer.salutation, 'Ms.');
});

Deno.test('[Unit] - Customer - create - Mx. salutation - creates successfully', () => {
    const customer = Customer.create('Mx.', 'Alex', 'Doe', 'alex@example.com');

    assertEquals(customer.salutation, 'Mx.');
});

Deno.test('[Unit] - Customer - create - invalid email - propagates email exception', () => {
    assertThrows(
        () => Customer.create('Mr.', 'John', 'Doe', 'invalid-email'),
        Error,
    );
});

Deno.test('[Unit] - Customer - create - empty email - propagates exception', () => {
    assertThrows(
        () => Customer.create('Mr.', 'John', 'Doe', ''),
        Error,
    );
});

Deno.test('[Unit] - Customer - create - valid complex name - creates successfully', () => {
    const customer = Customer.create('Ms.', 'Jean-Pierre', 'O\'Brien', 'jean.obrien@example.com');

    assertEquals(customer.firstName, 'Jean-Pierre');
    assertEquals(customer.lastName, 'O\'Brien');
});

Deno.test('[Unit] - Customer - create - long name - creates successfully', () => {
    const longFirstName = 'VeryVeryVeryVeryVeryVeryVeryLongFirstName';
    const longLastName = 'VeryVeryVeryVeryVeryVeryVeryLongLastName';

    const customer = Customer.create('Mr.', longFirstName, longLastName, 'test@example.com');

    assertEquals(customer.firstName, longFirstName);
    assertEquals(customer.lastName, longLastName);
});

Deno.test('[Unit] - Customer - create - case insensitive salutation variants - all normalize correctly', () => {
    const customerMr = Customer.create('mr', 'John', 'Doe', 'john@example.com');
    const customerMs = Customer.create('ms', 'Jane', 'Doe', 'jane@example.com');
    const customerMx = Customer.create('mx', 'Alex', 'Doe', 'alex@example.com');

    assertEquals(customerMr.salutation, 'Mr.');
    assertEquals(customerMs.salutation, 'Ms.');
    assertEquals(customerMx.salutation, 'Mx.');
});

Deno.test('[Unit] - Customer - reconstitute - with all salutations - restores correctly', () => {
    const mr = Customer.reconstitute({
        salutation: 'Mr.',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
    });

    const ms = Customer.reconstitute({
        salutation: 'Ms.',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
    });

    const mx = Customer.reconstitute({
        salutation: 'Mx.',
        firstName: 'Alex',
        lastName: 'Doe',
        email: 'alex@example.com',
    });

    assertEquals(mr.salutation, 'Mr.');
    assertEquals(ms.salutation, 'Ms.');
    assertEquals(mx.salutation, 'Mx.');
});

Deno.test('[Unit] - Customer - create - getters return correct values', () => {
    const customer = Customer.create('Ms.', 'Jane', 'Smith', 'jane@example.com');

    assertEquals(customer.salutation, 'Ms.');
    assertEquals(customer.firstName, 'Jane');
    assertEquals(customer.lastName, 'Smith');
    assertEquals(customer.email.value, 'jane@example.com');
});