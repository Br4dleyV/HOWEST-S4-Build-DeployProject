/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Abstraction for random number generation.
 * Allows for deterministic testing and different randomization strategies.
 */
export interface RandomProvider {
    /**
     * Returns a random number between 0 (inclusive) and 1 (exclusive).
     * Equivalent to Math.random().
     */
    random(): number;

    /**
     * Returns a random integer between 0 (inclusive) and max (exclusive).
     */
    randomInt(max: number): number;
}

/**
 * Default implementation using Math.random()
 */
export class MathRandomProvider implements RandomProvider {
    random(): number {
        return Math.random();
    }

    randomInt(max: number): number {
        return Math.floor(this.random() * max);
    }
}
