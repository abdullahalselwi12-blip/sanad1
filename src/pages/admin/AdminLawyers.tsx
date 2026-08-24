import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import type { Lawyer } from '@/types';

export function AdminLawyers() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filtered, setFiltered] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('lawyers').select('*, profile:profiles(*)').order('created_at', { ascending: false });
    setLawyers((data || []) as Lawyer[]);
    setFiltered((data || []) as Lawyer[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleVerify = async (l: Lawyer) => {
    const { error } = await supabase.from('lawyers').update({ is_verified: !l.is_verified }).eq('id', l.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast(l.is_verified ? 'تم إلغاء الاعتماد' : 'تم اعتماد المحامي', 'success');
    load();
  };

  const columns: Column<Lawyer>[] = [
    {
      key: 'name', label: 'المحامي', render: (l) => (
        <div className="flex items-center gap-2">
          <Avatar name={l.profile?.full_name || null} src={l.profile?.avatar_url || null} size="sm" />
          <div><p className="font-medium text-navy-900 dark:text-navy-100">{l.profile?.full_name}</p><p className="text-xs text-navy-400">{l.profile?.email}</p></div>
        </div>
      ),
    },
    { key: 'specialization', label: 'التخصص', render: (l) => <span className="text-sm">{l.specialization || '—'}</span> },
    { key: 'license_number', label: 'رقم الرخصة', render: (l) => <span className="text-sm">{l.license_number || '—'}</span> },
    { key: 'rating', label: 'التقييم', render: (l) => <span className="text-sm">{l.rating ? Number(l.rating).toFixed(1) : '—'}</span> },
    { key: 'is_verified', label: 'الاعتماد', render: (l) => <Badge variant={l.is_verified ? 'success' : 'gold'}>{l.is_verified ? 'معتمد' : 'قيد المراجعة'}</Badge> },
    {
      key: 'actions', label: 'إجراء', render: (l) => (
        <Button variant={l.is_verified ? 'ghost' : 'primary'} onClick={() => toggleVerify(l)} className="text-xs">
          {l.is_verified ? 'إلغاء الاعتماد' : 'اعتماد'}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      title="إدارة المحامين"
      data={filtered}
      columns={columns}
      loading={loading}
      rowKey={(l) => l.id}
      onSearch={(q) => setFiltered(lawyers.filter((l) => (l.profile?.full_name || '').includes(q) || (l.specialization || '').includes(q)))}
      searchPlaceholder="ابحث بالاسم أو التخصص..."
      emptyTitle="لا يوجد محامون"
      emptyDescription="لم يسجل أي محامٍ بعد"
    />
  );
}
