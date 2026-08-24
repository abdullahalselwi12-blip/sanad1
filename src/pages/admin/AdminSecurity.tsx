import { useEffect, useState, useCallback } from 'react';
import { Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/utils';
import type { SecurityLog } from '@/types';

export function AdminSecurity() {
  const [items, setItems] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('security_logs').select('*, profile:profiles(*)').order('created_at', { ascending: false }).limit(100);
    setItems((data || []) as SecurityLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<SecurityLog>[] = [
    { key: 'action', label: 'الإجراء', render: (l) => <span className="font-medium text-navy-900 dark:text-navy-100">{l.action}</span> },
    { key: 'user', label: 'المستخدم', render: (l) => <span className="text-xs">{l.profile?.email || '—'}</span> },
    { key: 'ip_address', label: 'عنوان IP', render: (l) => <code className="text-xs text-navy-500">{l.ip_address || '—'}</code> },
    { key: 'user_agent', label: 'المتصفح', render: (l) => <span className="text-xs text-navy-400 line-clamp-1 max-w-xs">{l.user_agent || '—'}</span> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (l) => l.created_at, render: (l) => <span className="text-xs">{formatDateTime(l.created_at)}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-royal-600" />
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الأمان وسجل العمليات</h1>
        </div>
        <p className="text-sm text-navy-500 dark:text-navy-400">سجل العمليات الأمنية على المنصة</p>
      </div>
      <DataTable title="" data={items} columns={columns} loading={loading} rowKey={(l) => l.id} emptyTitle="لا توجد سجلات" />
    </div>
  );
}
