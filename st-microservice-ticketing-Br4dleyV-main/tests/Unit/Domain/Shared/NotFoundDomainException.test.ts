import { assert, assertEquals } from '@std/assert';
import { DomainException, NotFoundDomainException } from '@/Domain/Shared/mod.ts';

Deno.test(
    'NotFoundDomainException - constructor - valid message - creates not found domain exception',
    () => {
        // Arrange
        const message = "Resource with id 'abc-123' was not found";

        // Act
        const exception = new NotFoundDomainException(message);

        // Assert
        assert(exception instanceof Error);
        assert(exception instanceof DomainException);
        assert(exception instanceof NotFoundDomainException);
        assertEquals(exception.message, message);
        assertEquals(exception.name, 'NotFoundDomainException');
    },
);
