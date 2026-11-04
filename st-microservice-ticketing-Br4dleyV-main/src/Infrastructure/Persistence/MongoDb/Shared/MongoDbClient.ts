import type {
    ClientSession,
    Collection,
    CreateCollectionOptions,
    DeleteResult,
    Document,
    Filter,
    InsertManyResult,
    InsertOneResult,
    MongoClient,
    OptionalUnlessRequiredId,
    UpdateResult,
    WithId,
} from '@mongodb';
import { Guard, IllegalStateException, Optional } from '@domaincrafters/std';

export class MongoDbClient {
    private readonly _client: MongoClient;
    private _session: ClientSession | undefined = undefined;

    static createConnectionString(
        protocol: string,
        host: string,
        port: string,
        options: string,
        dbName: string,
        user: string,
        password: string,
    ): string {
        Guard.check(protocol, 'persistence_mongodb_protocol').againstEmpty();
        Guard.check(host, 'persistence_mongodb_host').againstEmpty();
        Guard.check(Number.parseInt(port), 'persistence_mongodb_port').againstNegative();
        Guard.check(dbName, 'persistence_mongodb_db_name').againstEmpty();
        Guard.check(dbName, 'persistence_mongodb_db_name').againstWhitespace();

        const credentials: string = user && password ? `${user}:${password}@` : '';
        return `${protocol}://${credentials}${host}:${port}/${dbName}?${options}`;
    }

    constructor(client: MongoClient) {
        this._client = client;
    }

    collection<T extends Document>(collectionName: string): Collection<T> {
        const dbName: string = this._client.options.dbName;
        return this._client.db(dbName).collection(collectionName) as Collection<T>;
    }

    async createCollection(collectionName: string): Promise<void> {
        const dbName: string = this._client.options.dbName;
        const db = this._client.db(dbName);

        try {
            const collections = await db.listCollections({ name: collectionName }).toArray();
            if (collections.length === 0) {
                console.log(`Creating collection ${collectionName} in database ${dbName}`);

                const createOptions: CreateCollectionOptions = {};
                await db.createCollection(collectionName, createOptions);
                console.log(`Collection ${collectionName} created successfully`);
            }
        } catch (error) {
            throw this.convertErrorToIllegalStateException(
                error,
                `Failed to create collection ${collectionName}`,
            );
        }
    }

    async findDocument(
        filter: Filter<Document>,
        collectionName: string,
    ): Promise<Optional<Document>> {
        const collection: Collection<Document> = this.collection(collectionName);
        const document: WithId<Document> | null = await collection
            .findOne(filter, { session: this._session ?? undefined });

        if (document === null) {
            return Optional.empty<Document>();
        }

        return Optional.of<Document>(document as Document);
    }

    upsertDocument(
        filter: Filter<Document>,
        document: Document,
        collectionName: string,
    ): Promise<UpdateResult<Document>> {
        return this.collection(collectionName).updateOne(filter, { $set: document }, {
            upsert: true,
            session: this._session ?? undefined,
        });
    }

    insertDocument(
        document: Document,
        collectionName: string,
    ): Promise<InsertOneResult> {
        return this.collection(collectionName).insertOne(
            document as OptionalUnlessRequiredId<Document>,
            {
                forceServerObjectId: true,
                session: this._session ?? undefined,
            },
        );
    }

    insertManyDocuments(
        documents: ReadonlyArray<Document>,
        collectionName: string,
    ): Promise<InsertManyResult> {
        const collection: Collection<Document> = this.collection<Document>(collectionName);
        return collection.insertMany(
            documents as OptionalUnlessRequiredId<Document>[],
            {
                forceServerObjectId: true,
                session: this._session ?? undefined,
            },
        );
    }

    deleteDocument(
        filter: Filter<Document>,
        collectionName: string,
    ): Promise<DeleteResult> {
        const collection: Collection<Document> = this.collection<Document>(collectionName);
        return collection.deleteOne(filter, { session: this._session ?? undefined });
    }

    all(collectionName: string): Promise<Document[]> {
        return this.collection<Document>(collectionName).find({}, { session: this.session })
            .toArray();
    }

    get session(): ClientSession {
        if (!this._session) {
            this._session = this._client.startSession();
        }
        return this._session;
    }

    async connect(): Promise<void> {
        try {
            await this._client.connect();
            // Reset session after reconnect
            if (this._session) {
                this._session.endSession();
            }
            this._session = this._client.startSession();
        } catch (error: unknown) {
            throw this.convertErrorToIllegalStateException(error, 'Failed to connect to MongoDB');
        }
    }

    async close(): Promise<void> {
        try {
            if (this._session) {
                await this._session.endSession();
            }
            await this._client.close();
        } catch (error: unknown) {
            throw this.convertErrorToIllegalStateException(
                error,
                'Failed to close MongoDB connection',
            );
        }
    }

    endSession(): void {
        if (this._session) {
            this._session.endSession();
            this._session = undefined;
        }
    }

    private convertErrorToIllegalStateException(
        error: unknown,
        msg: string,
    ): IllegalStateException {
        const message: string = `${msg}: ${JSON.stringify(error)}`;
        return new IllegalStateException(message);
    }

    findDocumentsByPipeline(
        pipeline: Document[],
        _collectionName: string,
    ): Promise<Document[]> {
        return this.collection(_collectionName).aggregate(pipeline, {
            session: this._session ?? undefined,
        })
            .toArray();
    }
}
