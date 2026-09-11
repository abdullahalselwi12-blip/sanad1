import type { Law } from '@/types';
import { KeywordSearchStrategy } from './KeywordSearchStrategy';
import { SemanticSearchStrategy } from './SemanticSearchStrategy';
import type { LawSearchParams, SearchStrategy } from './SearchStrategy';

export class HybridSearchStrategy implements SearchStrategy {
  private readonly keywordStrategy = new KeywordSearchStrategy();
  private readonly semanticStrategy = new SemanticSearchStrategy();

  async search(params: LawSearchParams): Promise<Law[]> {
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordStrategy.search(params),
      this.semanticStrategy.search(params),
    ]);

    const uniqueLaws = new Map<string, Law>();

    for (const law of keywordResults) {
      uniqueLaws.set(law.id, law);
    }

    for (const law of semanticResults) {
      uniqueLaws.set(law.id, law);
    }

    return Array.from(uniqueLaws.values());
  }
}