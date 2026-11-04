import { assert, assertEquals, assertStrictEquals } from '@std/assert';
import { DomainException } from '@/Domain/Shared/mod.ts';

type CaptureStackTraceFn = (targetObject: object, constructorOpt?: Function) => void;
type ErrorWithCaptureStackTrace = ErrorConstructor & {
    captureStackTrace?: CaptureStackTraceFn;
};

const restoreCaptureStackTrace = (
    errorWithCapture: ErrorWithCaptureStackTrace,
    originalDescriptor: PropertyDescriptor | undefined,
): void => {
    if (originalDescriptor) {
        Object.defineProperty(errorWithCapture, 'captureStackTrace', originalDescriptor);
        return;
    }

    Reflect.deleteProperty(errorWithCapture, 'captureStackTrace');
};

Deno.test('DomainException - constructor - valid message - creates error with proper metadata', () => {
    // Arrange
    const message = 'Business rule violated';

    // Act
    const exception = new DomainException(message);

    // Assert
    assert(exception instanceof Error);
    assert(exception instanceof DomainException);
    assertEquals(exception.message, message);
    assertEquals(exception.name, 'DomainException');
});

Deno.test('DomainException - constructor - captureStackTrace available - invokes captureStackTrace', () => {
    // Arrange
    const errorWithCapture = Error as ErrorWithCaptureStackTrace;
    const originalDescriptor = Object.getOwnPropertyDescriptor(
        errorWithCapture,
        'captureStackTrace',
    );

    let called = false;
    let capturedTarget: object | undefined;
    let capturedConstructor: Function | undefined;

    Object.defineProperty(errorWithCapture, 'captureStackTrace', {
        configurable: true,
        value: (targetObject: object, constructorOpt?: Function) => {
            called = true;
            capturedTarget = targetObject;
            capturedConstructor = constructorOpt;
        },
    });

    try {
        // Act
        const exception = new DomainException('With stack trace');

        // Assert
        assert(called);
        assertStrictEquals(capturedTarget, exception);
        assertStrictEquals(capturedConstructor, DomainException);
    } finally {
        restoreCaptureStackTrace(errorWithCapture, originalDescriptor);
    }
});

Deno.test('DomainException - constructor - captureStackTrace unavailable - still creates exception', () => {
    // Arrange
    const errorWithCapture = Error as ErrorWithCaptureStackTrace;
    const originalDescriptor = Object.getOwnPropertyDescriptor(
        errorWithCapture,
        'captureStackTrace',
    );

    Object.defineProperty(errorWithCapture, 'captureStackTrace', {
        configurable: true,
        value: undefined,
    });

    try {
        // Act
        const exception = new DomainException('Without stack trace');

        // Assert
        assert(exception instanceof DomainException);
        assertEquals(exception.message, 'Without stack trace');
        assertEquals(exception.name, 'DomainException');
    } finally {
        restoreCaptureStackTrace(errorWithCapture, originalDescriptor);
    }
});
