import { supabase } from '@/lib/supabase';
import { fetchLaws } from '@/lib/api';
import type { Law, LawCategory } from '@/types';
import type { IRepository } from './IRepository';

/**
 * Repository Pattern
 *
 * مسؤول عن الوصول إلى بيانات القوانين.
 *
 * - عمليات القراءة تستخدم API الموجود في SANAD.
 * - عمليات الإنشاء والتعديل والحذف تستخدم Supabase.
 * - لا نغير api.ts ولا قاعدة البيانات.
 */

export interface LawSearchParams {
  search?: string;
  category?: LawCategory | 'all';
  limit?: number;
  page?: number;
}

export class LawRepository implements IRepository<Law> {
  private readonly tableName = 'laws';

  /**
   * جلب قانون واحد بواسطة ID
   */
  async getById(id: string): Promise<Law | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch law: ${error.message}`);
    }

    return data as Law | null;
  }

  /**
   * جلب جميع القوانين
   */
  async getAll(): Promise<Law[]> {
    const result = await fetchLaws({
      limit: 100,
    });

    return result.data;
  }

  /**
   * البحث والتصفية في القوانين
   *
   * هذه هي الدالة التي ستستخدمها صفحة القوانين.
   */
  async search(params: LawSearchParams = {}): Promise<Law[]> {
    const result = await fetchLaws({
      search: params.search,
      category: params.category,
      limit: params.limit ?? 100,
      page: params.page,
    });

    return result.data;
  }

  /**
   * إنشاء قانون
   */
  async create(data: Partial<Law>): Promise<Law> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create law: ${error.message}`);
    }

    return created as Law;
  }

  /**
   * تحديث قانون
   */
  async update(id: string, data: Partial<Law>): Promise<Law> {
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update law: ${error.message}`);
    }

    return updated as Law;
  }

  /**
   * حذف قانون
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete law: ${error.message}`);
    }
  }
}

/**
 * نسخة واحدة من Repository
 */
export const lawRepository = new LawRepository();