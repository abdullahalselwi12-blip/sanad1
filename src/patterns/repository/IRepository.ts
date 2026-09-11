/**
 * Repository Pattern
 *
 * واجهة عامة للتعامل مع البيانات.
 * الهدف هو فصل منطق الوصول للبيانات عن باقي أجزاء التطبيق.
 */

export interface IRepository<T, TId = string> {
  getById(id: TId): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: TId, data: Partial<T>): Promise<T>;
  delete(id: TId): Promise<void>;
}