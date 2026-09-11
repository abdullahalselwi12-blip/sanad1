import type { Law, LawCategory } from '@/types';

export interface LawSearchParams {
  search?: string;
  category?: LawCategory | 'all';
  limit?: number;
  page?: number;
}

export interface SearchStrategy {
  search(params: LawSearchParams): Promise<Law[]>;
}