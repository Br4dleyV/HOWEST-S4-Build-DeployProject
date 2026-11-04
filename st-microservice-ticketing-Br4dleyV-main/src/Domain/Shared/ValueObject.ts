/**
 * Abstract base class for Value Objects in Domain-Driven Design.
 *
 * Value Objects are immutable objects that represent descriptive aspects of the domain
 * with no conceptual identity. They are defined only by their attributes.
 *
 * Key Characteristics:
 * - Immutable: Once created, cannot be changed
 * - Equals by value: Two value objects are equal if all their attributes are equal
 * - Side-effect free: Operations return new instances rather than modifying state
 * - Self-validating: Validation happens during construction
 *
 * @example
 * ```typescript
 * export class Email extends ValueObject {
 *     private readonly _value: string;
 *
 *     private constructor(value: string) {
 *         super();
 *         this._value = value;
 *     }
 *
 *     static create(email: string): Email {
 *         const trimmed = email.trim().toLowerCase();
 *         const instance = new Email(trimmed);
 *         instance.validate();
 *         return instance;
 *     }
 *
 *     protected validate(): void {
 *         if (!this._value || !this._value.includes('@')) {
 *             throw new InvalidEmailException(this._value);
 *         }
 *     }
 *
 *     equals(other: Email): boolean {
 *         return other && this._value === other._value;
 *     }
 *
 * }
 * ```
 */
export abstract class ValueObject {
    /**
     * Compares this value object with another for equality.
     * Subclasses must implement their own equality logic.
     *
     * @param other - The value object to compare with
     * @returns True if values are equal, false otherwise
     */
    abstract equals(other: ValueObject): boolean;
}
