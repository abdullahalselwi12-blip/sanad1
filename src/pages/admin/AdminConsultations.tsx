import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Consultation } from '@/types';

export function AdminConsultations() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('consultations').select('*, profile:profiles(*), lawyer:lawyers(*)').order('created_at', { ascending: false });
    setItems((data || []) as Consultation[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Consultation>[] = [
    { key: 'subject', label: 'الموضوع', render: (c) => <span className="font-medium text-navy-900 dark:text-navy-100">{c.subject}</span> },
    { key: 'user', label: 'المستخدم', render: (c) => <div className="flex items-center gap-2"><Avatar name={c.profile?.full_name || null} size="sm" /><span className="text-xs">{c.profile?.full_name || c.profile?.email}</span></div> },
    { key: 'question', label: 'السؤال', render: (c) => <span className="text-xs text-navy-500 line-clamp-1">{c.question}</span> },
    { key: 'status', label: 'الحالة', render: (c) => <Badge variant={CONSULTATION_STATUSES[c.status].color}>{CONSULTATION_STATUSES[c.status].label}</Badge> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (c) => c.created_at, render: (c) => <span className="text-xs">{timeAgo(c.created_at)}</span> },
  ];

  return <DataTable title="إدارة الاستشارات" data={items} columns={columns} loading={loading} rowKey={(c) => c.id} onSearch={(q) => setItems(items.filter((c) => c.subject.includes(q)))} searchPlaceholder="ابحث..." emptyTitle="لا توجد استشارات" />;
}
