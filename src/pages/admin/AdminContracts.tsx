import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { CONTRACT_STATUSES, DOCUMENT_TYPES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Contract } from '@/types';

export function AdminContracts() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contracts').select('*, profile:profiles(*)').order('created_at', { ascending: false });
    setItems((data || []) as Contract[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Contract>[] = [
    { key: 'title', label: 'العنوان', render: (c) => <span className="font-medium text-navy-900 dark:text-navy-100">{c.title}</span> },
    { key: 'type', label: 'النوع', render: (c) => <span className="text-xs">{DOCUMENT_TYPES[c.type]}</span> },
    { key: 'user', label: 'المستخدم', render: (c) => <span className="text-xs">{c.profile?.email}</span> },
    { key: 'status', label: 'الحالة', render: (c) => <Badge variant={CONTRACT_STATUSES[c.status].color}>{CONTRACT_STATUSES[c.status].label}</Badge> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (c) => c.created_at, render: (c) => <span className="text-xs">{timeAgo(c.created_at)}</span> },
  ];

  return <DataTable title="إدارة العقود" data={items} columns={columns} loading={loading} rowKey={(c) => c.id} emptyTitle="لا توجد عقود" />;
}
