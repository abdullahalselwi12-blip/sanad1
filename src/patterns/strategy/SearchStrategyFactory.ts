import { HybridSearchStrategy } from './HybridSearchStrategy';
import { KeywordSearchStrategy } from './KeywordSearchStrategy';
import { SemanticSearchStrategy } from './SemanticSearchStrategy';
import type { SearchStrategy } from './SearchStrategy';

export type SearchStrategyType =
  | 'keyword'
  | 'semantic'
  | 'hybrid';

export class SearchStrategyFactory {
  static create(type: SearchStrategyType): SearchStrategy {
    switch (type) {
      case 'keyword':
        return new KeywordSearchStrategy();

      case 'semantic':
        return new SemanticSearchStrategy();

      case 'hybrid':
        return new HybridSearchStrategy();

      default:
        return new KeywordSearchStrategy();
    }
  }
}