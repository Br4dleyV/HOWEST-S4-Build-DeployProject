import type { Repository } from '@/Domain/Shared/mod.ts';
import type { Suggestion, SuggestionId } from './Suggestion.ts';

export interface SuggestionRepository extends Repository<Suggestion, SuggestionId> {}
