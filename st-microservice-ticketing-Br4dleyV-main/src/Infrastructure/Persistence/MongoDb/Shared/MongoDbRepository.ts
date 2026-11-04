import type { DeleteResult, Document, Filter } from '@mongodb';
import { IllegalStateException, Optional } from '@domaincrafters/std';
import type { MongoDbClient } from './MongoDbClient.ts';
import type { DocumentMapper } from './mod.ts';
import { AggregateRoot, EntityId, Repository } from '../../../../Domain/Shared/mod.ts';

export abstract class MongoDbRepository<
    E extends AggregateRoot<AggregateId>,
    AggregateId extends EntityId = EntityId,
> implements Repository<E, AggregateId> {
    public static readonly collectionName: string = '';
    protected readonly _dbClient: MongoDbClient;
    private readonly _collectionName: string;
    private readonly _documentMapper: DocumentMapper<E>;

    constructor(
        dbClient: MongoDbClient,
        documentMapper: DocumentMapper<E>,
        collectionName: string = '',
    ) {
        this._dbClient = dbClient;
        this._collectionName = collectionName;
        if (this._collectionName === '') {
            throw new IllegalStateException(
                'MongoDbRepository must be instantiated with a collection name',
            );
        }
        this._documentMapper = documentMapper;
    }

    async byId(id: AggregateId): Promise<Optional<E>> {
        const document: Optional<Document> = await this._dbClient.findDocument(
            this.buildFilterByEntityId(id),
            this._collectionName,
        );

        if (!document.isPresent) {
            return Optional.empty<E>();
        }

        return document.map(this._documentMapper.reconstitute.bind(this._documentMapper));
    }

    protected async allByPipeline(pipeline: Document[]): Promise<E[]> {
        const documents: Document[] = await this._dbClient.findDocumentsByPipeline(
            pipeline,
            this._collectionName,
        );

        return documents.map(this._documentMapper.reconstitute.bind(this._documentMapper));
    }

    async save(entity: E): Promise<void> {
        const document: Document = this._documentMapper.toDocument(entity);

        const insertResult = await this._dbClient.upsertDocument(
            this.buildFilterByEntityId(entity.id),
            document,
            this._collectionName,
        );

        if (
            !insertResult.acknowledged ||
            (insertResult.matchedCount === 0 && insertResult.upsertedCount === 0)
        ) {
            throw new IllegalStateException(
                `Entity with id ${entity.id.value} was not upserted`,
            );
        }
    }

    async remove(entity: E): Promise<void> {
        const deleteResult: DeleteResult = await this._dbClient.deleteDocument(
            this.buildFilterByEntityId(entity.id),
            this._collectionName,
        );

        if (!deleteResult.acknowledged || deleteResult.deletedCount === 0) {
            throw new IllegalStateException(`Entity with id ${entity.id.value} was not deleted`);
        }
    }

    private buildFilterByEntityId(id: EntityId): Filter<Document> {
        return { _id: id.toString() } as unknown as Filter<Document>;
    }

    abstract get entityName(): string;
}
