/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Entity } from './Entity.ts';
import type { EntityId } from './EntityId.ts';
import type { DomainEvent } from './DomainEvents/DomainEvent.ts';

/**
 * Represents an Aggregate Root within the context of Domain Driven Development.
 *
 * An Aggregate Root is a special type of Entity that serves as the entry point to an aggregate.
 * It is responsible for maintaining the consistency of changes within the aggregate boundary
 * and managing domain events that occur within the aggregate.
 *
 * @example Usage
 * ```typescript
 * import { UUIDEntityId } from './UUIDEntityId.ts';
 * import { AggregateRoot } from './AggregateRoot.ts';
 * import { TournamentCreated } from './TournamentCreated.ts';
 *
 * // Example of extending AggregateRoot with a typed ID for a specific domain aggregate
 * class Tournament extends AggregateRoot<EntityId> {
 *     private readonly _name: TournamentName;
 *     private readonly _date: TournamentDate;
 *
 *     private constructor(id: EntityId, name: TournamentName, date: TournamentDate) {
 *         super(id);
 *         this._name = name;
 *         this._date = date;
 *     }
 *
 *     static create(name: string, date: Date): Tournament {
 *         // Value objects validate themselves
 *         const tournamentName = TournamentName.create(name);
 *         const tournamentDate = TournamentDate.create(date);
 *
 *         // Construct aggregate (constructor only assigns)
 *         const id = new UUIDEntityId(UUIDEntityId.generate());
 *         const tournament = new Tournament(id, tournamentName, tournamentDate);
 *
 *         // Raise domain event
 *         tournament.raise(new TournamentCreated(id.toString(), name, date));
 *         return tournament;
 *     }
 * }
 *
 * // Creating a new Tournament aggregate
 * const tournament = Tournament.create(
 *     TournamentName.create('Grand Prix'),
 *     TournamentDate.create(new Date()),
 *     TournamentType.LimitedDraft,
 * );
 *
 * // Accessing domain events
 * tournament.hasDomainEvents(); // true
 * const events = tournament.pullDomainEvents();
 * events.length;
 * ```
 */
export abstract class AggregateRoot<TId extends EntityId> extends Entity<TId> {
    private _domainEvents: DomainEvent[] = [];

    /**
     * Creates an instance of AggregateRoot<EntityId>.
     *
     * @param id - The unique identifier for the aggregate root.
     */
    constructor(id: TId) {
        super(id);
    }

    /**
     * Record a domain event that occurred in this aggregate.
     * Events are stored internally and can be retrieved using pullDomainEvents().
     *
     * @param event - The domain event to record
     */
    protected raise(event: DomainEvent): void {
        this._domainEvents.push(event);
    }

    /**
     * Retrieve all domain events and clear the internal event list.
     * This follows the "pull" pattern where the application layer retrieves events after persistence.
     *
     * @returns Array of domain events that occurred in this aggregate
     */
    pullDomainEvents(): DomainEvent[] {
        const events = [...this._domainEvents];
        this._domainEvents = [];

        return events;
    }

    /**
     * Get a read-only view of domain events without clearing them.
     * Useful for testing or inspection without side effects.
     *
     * @returns Read-only array of domain events
     */
    get domainEvents(): ReadonlyArray<DomainEvent> {
        return this._domainEvents;
    }

    /**
     * Check if this aggregate has any pending domain events.
     *
     * @returns true if there are pending events, false otherwise
     */
    hasDomainEvents(): boolean {
        return this._domainEvents.length > 0;
    }
}
