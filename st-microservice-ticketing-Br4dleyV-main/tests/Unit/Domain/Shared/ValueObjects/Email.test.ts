import { assertEquals, assertThrows } from '@std/assert';
import { Email, InvalidEmailException } from '@/Domain/Shared/mod.ts';

Deno.test('[Unit] - Email - create - valid input - normalizes and returns value object', () => {
    // Arrange
    const rawEmail = '  USER@Example.COM  ';

    // Act
    const email = Email.create(rawEmail);

    // Assert
    assertEquals(email.value, 'user@example.com');
});

Deno.test('[Unit] - Email - create - empty input - throws InvalidEmailException', () => {
    // Arrange
    const invalidEmail = '   ';

    // Act & Assert
    assertThrows(
        () => Email.create(invalidEmail),
        InvalidEmailException,
    );
});

Deno.test('[Unit] - Email - create - malformed input - throws InvalidEmailException', () => {
    // Arrange
    const invalidEmail = 'invalid-email';

    // Act & Assert
    assertThrows(
        () => Email.create(invalidEmail),
        InvalidEmailException,
    );
});

Deno.test('[Unit] - Email - equals - equivalent normalized values - returns true', () => {
    // Arrange
    const left = Email.create('Test@Example.com');
    const right = Email.create(' test@example.com ');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - Email - equals - different values - returns false', () => {
    // Arrange
    const left = Email.create('first@example.com');
    const right = Email.create('second@example.com');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - Email - toString - valid instance - returns normalized value', () => {
    // Arrange
    const email = Email.create('user@example.com');

    // Act
    const result = email.toString();

    // Assert
    assertEquals(result, 'user@example.com');
});
