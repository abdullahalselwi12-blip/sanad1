import { fetchLaws } from '@/lib/api';
import type { Law } from '@/types';
import type { LawSearchParams, SearchStrategy } from './SearchStrategy';

export class SemanticSearchStrategy implements SearchStrategy {
  async search(params: LawSearchParams): Promise<Law[]> {
    const query = params.search?.trim() || '';

    if (!query) {
      const result = await fetchLaws({
        category: params.category,
        limit: params.limit ?? 100,
        page: params.page,
      });

      return result.data;
    }

    /*
     * بحث دلالي بسيط وآمن:
     * نوسّع بعض المصطلحات القانونية الشائعة إلى كلمات قريبة
     * ثم نرسلها لنفس API الموجود في المشروع.
     */
    const semanticTerms: Record<string, string> = {
      عقد: 'عقد اتفاق',
      عقود: 'عقد اتفاق',
      عمل: 'عمل موظف عمال',
      موظف: 'موظف عمل',
      شركة: 'شركة مؤسسة',
      مؤسسة: 'مؤسسة شركة',
      إيجار: 'إيجار تأجير',
      تأجير: 'إيجار تأجير',
      جريمة: 'جريمة جنائي عقوبة',
      جنائي: 'جريمة جنائي عقوبة',
      زواج: 'زواج أسرة أحوال شخصية',
      طلاق: 'طلاق أسرة أحوال شخصية',
      ميراث: 'ميراث تركة ورثة',
      ورثة: 'ميراث تركة ورثة',
      تجارة: 'تجارة تجاري',
      تجاري: 'تجارة تجاري',
    };

    const words = query.split(/\s+/).filter(Boolean);

    const expandedWords = words.map(
      (word) => semanticTerms[word] || word
    );

    const expandedQuery = expandedWords.join(' ');

    const result = await fetchLaws({
      search: expandedQuery,
      category: params.category,
      limit: params.limit ?? 100,
      page: params.page,
    });

    return result.data;
  }
}