/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { UUID } from 'jsr:@domaincrafters/std@1';
import { type EntityId, ValueObject } from './mod.ts';

/**
 * Represents a UUID-based Entity Identifier in the context of Domain Driven Development.
 *
 * This abstract class provides a foundation for creating entity identifiers using UUIDs.
 * It ensures that each entity has a unique and consistent identifier across the domain.
 *
 * @example Usage
 * ```typescript
 * // Example of extending UUIDEntityId for a specific domain entity
 * class UserId extends UUIDEntityId {}
 *
 * // Generating a new UserID based on UUID
 * const userId = UserId.create();

 * // Comparing two UserIds for equality
 * const anotherUserId = UserId.create();
 * const isEqual = userId.equals(anotherUserId);
 * isEqual;
 *
 * // Getting the string representation of the UserId
 * userId.toString();
 *
 * // Accessing the UUID value directly
 * userId.value;
 * ```
 */

export abstract class UUIDEntityId extends ValueObject implements EntityId {
    protected readonly _id: string;
    private static readonly UUID_PATTERN =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    /**
     * Creates an instance of UUIDEntityId.
     *
     * @param id - The optional UUID string value to use as the entity identifier. If not provided, a new UUID will be generated.
     */
    protected constructor(id?: string) {
        super();

        if (id === undefined) {
            this._id = UUID.create().value;
            return;
        }

        if (!UUIDEntityId.UUID_PATTERN.test(id)) {
            throw new Error('Invalid UUID');
        }

        this._id = id.toLowerCase();
    }

    /**
     * Compares this entity ID with another to determine equality.
     *
     * @param other - The other UUIDEntityId to compare with.
     * @returns `true` if both UUIDEntityIds have the same value and type, otherwise `false`.
     */
    equals(other: UUIDEntityId): boolean {
        return this._id === (other._id) && this.constructor === other.constructor;
    }

    /**
     * Returns the string representation of the entity ID.
     *
     * @returns The UUID string value of the entity ID.
     */
    override toString(): string {
        return this.value;
    }

    /**
     * Retrieves the UUID string value of the entity ID.
     *
     * @returns The UUID string value.
     */
    get value(): string {
        return this._id;
    }
}
