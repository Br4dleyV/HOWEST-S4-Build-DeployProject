export { Suggestion, SuggestionId } from './Suggestion.ts';
export { type SuggestionRepository } from './SuggestionRepository.ts';
export { SuggestionCreatedDomainEvent } from './Events/SuggestionCreatedDomainEvent.ts';
export { SuggestionDomainEvent } from './Events/SuggestionDomainEvent.ts';
export {
    InvalidSuggestionTitleException,
    SuggestionTitle,
} from './ValueObjects/SuggestionTitle.ts';
export {
    InvalidSuggestionDescriptionException,
    SuggestionDescription,
} from './ValueObjects/SuggestionDescription.ts';
