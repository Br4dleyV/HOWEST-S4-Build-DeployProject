/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { Optional } from 'jsr:@domaincrafters/std@1';
import { AggregateRoot, EntityId } from './mod.ts';

/**
 * Defines a generic repository interface for managing domain aggregates within Domain Driven Development.
 *
 * The `Repository` interface provides the standard operations for accessing and manipulating
 * domain aggregates. It abstracts the data storage mechanism, allowing for flexibility and
 * ease of testing.
 *
 * @typeParam E - The type of the AggregateRoot<EntityId> managed by the repository.
 */
export interface Repository<E extends AggregateRoot<ID>, ID extends EntityId = EntityId> {
    /**
     * Retrieves an AggregateRoot<EntityId> by its unique identifier.
     *
     * @param id - The unique identifier of the AggregateRoot<EntityId> to retrieve.
     * @returns A promise that resolves to an Optional containing the AggregateRoot<EntityId> if found, or empty if not found.
     */
    byId(id: ID): Promise<Optional<E>>;

    /**
     * Persists the given AggregateRoot<EntityId> to the repository.
     *
     * @param AggregateRoot<EntityId> - The AggregateRoot<EntityId> to save.
     * @returns A promise that resolves when the AggregateRoot<EntityId> has been successfully saved.
     */
    save(aggregateRoot: E): Promise<void>;

    /**
     * Removes the given AggregateRoot<EntityId> from the repository.
     *
     * @param AggregateRoot<EntityId> - The AggregateRoot<EntityId> to remove.
     * @returns A promise that resolves when the AggregateRoot<EntityId> has been successfully removed.
     */
    remove(aggregateRoot: E): Promise<void>;
}
