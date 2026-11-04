import type { Repository } from '@/Domain/Shared/mod.ts';
import type { Movie, MovieId } from './Movie.ts';

export interface MovieRepository extends Repository<Movie, MovieId> {}
