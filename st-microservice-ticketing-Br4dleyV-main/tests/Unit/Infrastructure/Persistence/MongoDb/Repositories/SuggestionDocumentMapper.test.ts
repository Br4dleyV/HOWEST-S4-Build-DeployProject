import { assertEquals } from '@std/assert';

import { Suggestion } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { SuggestionDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';

Deno.test('[Unit] - SuggestionDocumentMapper - toDocument and reconstitute - round trips suggestion snapshot', () => {
    const mapper = new SuggestionDocumentMapper();
    const suggestion = Suggestion.create(
        'user@example.com',
        'Improve booking performance',
        'Cache frequently requested movie data to reduce latency.',
    );

    const document = mapper.toDocument(suggestion);
    const reconstituted = mapper.reconstitute(document);

    assertEquals(document._id, suggestion.id.value);
    assertEquals(document.email, suggestion.email.value);
    assertEquals(reconstituted.id.value, suggestion.id.value);
    assertEquals(reconstituted.email.value, suggestion.email.value);
    assertEquals(reconstituted.title.value, suggestion.title.value);
    assertEquals(reconstituted.description.value, suggestion.description.value);
});

Deno.test('[Unit] - SuggestionDocumentMapper - reconstitute - uses fallback id field', () => {
    const mapper = new SuggestionDocumentMapper();
    const suggestion = mapper.reconstitute({
        id: '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469',
        email: 'user@example.com',
        title: 'Improve booking performance',
        description: 'Cache frequently requested movie data to reduce latency.',
    } as never);

    assertEquals(suggestion.id.value, '8fdd8b8e-8de4-4b9a-8e16-868b72f4f469');
});
