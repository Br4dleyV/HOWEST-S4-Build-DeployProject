import { DomainException } from './DomainException.ts';

/**
 * Base class for domain-level "resource not found" exceptions.
 * Web/API adapters can map this category to HTTP 404.
 */
export class NotFoundDomainException extends DomainException {
    constructor(message: string) {
        super(message);
    }
}
