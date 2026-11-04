import type { Document } from '@mongodb';

import { EntityId } from '@/Domain/Shared/mod.ts';

export interface DocumentMapper<Entity> {
    reconstitute(document: Document): Entity;
    toDocument(entity: Entity): Document;
}

function isEntityId(value: unknown): value is EntityId {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as EntityId).value === 'string' &&
        typeof (value as EntityId).toString === 'function'
    );
}

// deno-lint-ignore no-explicit-any
export function serializeObjectToDocument(object: any): any {
    if (Array.isArray(object)) {
        return object.map(serializeObjectToDocument);
    }

    if (isEntityId(object)) {
        return object.toString();
    }

    if (object instanceof Date) {
        return new Date(object);
    }

    if (object !== null && typeof object === 'object') {
        const newObj: Record<string, unknown> = {};
        for (const key in object) {
            if (Object.hasOwn(object, key)) {
                const newKey = key.startsWith('_') ? key.substring(1) : key;
                newObj[newKey] = serializeObjectToDocument(
                    (object as Record<string, unknown>)[key],
                );
            }
        }

        return newObj;
    }

    return object;
}
