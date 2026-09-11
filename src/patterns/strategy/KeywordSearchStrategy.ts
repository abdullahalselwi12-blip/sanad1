import { fetchLaws } from '@/lib/api';
import type { Law } from '@/types';
import type { LawSearchParams, SearchStrategy } from './SearchStrategy';

export class KeywordSearchStrategy implements SearchStrategy {
  async search(params: LawSearchParams): Promise<Law[]> {
    const query = params.search?.trim() || '';

    const result = await fetchLaws({
      search: query,
      category: params.category,
      limit: params.limit ?? 100,
      page: params.page,
    });

    return result.data;
  }
}