import { Movie, MovieId, MovieRepository } from '@/Domain/Ticketing/Movies/mod.ts';
import { MongoDbClient, MongoDbRepository } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { MovieDocumentMapper } from './Mappers/MovieDocumentMapper.ts';

export class MongoDbMovieRepository extends MongoDbRepository<Movie, MovieId> implements MovieRepository {
    static override readonly collectionName: string = 'movies';

    constructor(client: MongoDbClient, mapper: MovieDocumentMapper) {
        super(client, mapper, MongoDbMovieRepository.collectionName);
    }

    override get entityName(): string {
        return Movie.name;
    }
}
