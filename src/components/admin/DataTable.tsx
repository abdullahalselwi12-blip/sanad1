import { type ReactNode, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { cn } from '@/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onSearch?: (q: string) => void;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  addLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  title: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  data, columns, loading, searchPlaceholder, onSearch, onAdd, onEdit, onDelete, addLabel, emptyTitle, emptyDescription, title, rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return 0;
    const av = col.sortValue(a);
    const bv = col.sortValue(b);
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{title}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSearch && (
            <div className="flex-1 sm:w-64">
              <Input
                placeholder={searchPlaceholder || 'بحث...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); onSearch(e.target.value); }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="shrink-0">
              <Plus className="w-4 h-4" /> {addLabel || 'إضافة'}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : sorted.length === 0 ? (
        <EmptyState title={emptyTitle || 'لا توجد بيانات'} description={emptyDescription} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50 dark:bg-navy-800/50 border-b border-navy-100 dark:border-navy-800">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col)}
                      className={cn(
                        'px-4 py-3 text-right text-xs font-semibold text-navy-600 dark:text-navy-300 uppercase tracking-wider',
                        col.sortable && 'cursor-pointer hover:text-navy-900 dark:hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </span>
                    </th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-4 py-3 text-right text-xs font-semibold text-navy-600 dark:text-navy-300 uppercase">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {sorted.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-navy-700 dark:text-navy-200">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {onEdit && (
                            <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg hover:bg-royal-50 dark:hover:bg-royal-900/20 text-navy-400 hover:text-royal-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-navy-400 hover:text-error-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="تأكيد الحذف" size="sm">
        <p className="text-sm text-navy-600 dark:text-navy-300 mb-4">هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
          <Button variant="danger" onClick={() => { if (deleteTarget && onDelete) onDelete(deleteTarget); setDeleteTarget(null); }}>
            <Trash2 className="w-4 h-4" /> حذف
          </Button>
        </div>
      </Modal>
    </div>
  );
}
