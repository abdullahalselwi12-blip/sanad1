import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import type { Lawyer, Profile } from '@/types';

interface PendingLawyer {
  id: string;
  profile: Profile;
  isPending: true;
}

type LawyerRow = (Lawyer & { isPending?: false }) | PendingLawyer;

export function AdminLawyers() {
  const [rows, setRows] = useState<LawyerRow[]>([]);
  const [filtered, setFiltered] = useState<LawyerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: lawyerData }, { data: profileData }] = await Promise.all([
      supabase.from('lawyers').select('*, profile:profiles(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'lawyer').eq('is_active', true).order('created_at', { ascending: false }),
    ]);

    const existing = (lawyerData || []) as Lawyer[];
    const profiles = (profileData || []) as Profile[];
    const existingIds = new Set(existing.map((l) => l.profile_id));
    const pending: PendingLawyer[] = profiles
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({ id: p.id, profile: p, isPending: true as const }));

    const combined: LawyerRow[] = [...existing.map((l) => ({ ...l, isPending: false as const })), ...pending];
    setRows(combined);
    setFiltered(combined);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleVerify = async (l: Lawyer) => {
    const { error } = await supabase.from('lawyers').update({ is_verified: !l.is_verified }).eq('id', l.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast(l.is_verified ? 'تم إلغاء الاعتماد' : 'تم اعتماد المحامي', 'success');
    load();
  };

  const approvePending = async (p: PendingLawyer) => {
    setApproving(p.id);
    const { error } = await supabase.from('lawyers').insert({
      profile_id: p.id,
      is_verified: true,
    });
    setApproving(null);
    if (error) { toast('حدث خطأ أثناء الاعتماد', 'error'); return; }
    toast('تم اعتماد المحامي بنجاح', 'success');
    load();
  };

  const columns: Column<LawyerRow>[] = [
    {
      key: 'name', label: 'المحامي', render: (l) => (
        <div className="flex items-center gap-2">
          <Avatar name={l.profile?.full_name || null} src={l.profile?.avatar_url || null} size="sm" />
          <div><p className="font-medium text-navy-900 dark:text-navy-100">{l.profile?.full_name}</p><p className="text-xs text-navy-400">{l.profile?.email}</p></div>
        </div>
      ),
    },
    { key: 'specialization', label: 'التخصص', render: (l) => <span className="text-sm">{!l.isPending ? (l.specialization || '—') : '—'}</span> },
    { key: 'license_number', label: 'رقم الرخصة', render: (l) => <span className="text-sm">{!l.isPending ? (l.license_number || '—') : '—'}</span> },
    { key: 'rating', label: 'التقييم', render: (l) => <span className="text-sm">{!l.isPending && l.rating ? Number(l.rating).toFixed(1) : '—'}</span> },
    { key: 'is_verified', label: 'الاعتماد', render: (l) => (
      <Badge variant={l.isPending ? 'gold' : (l.is_verified ? 'success' : 'gold')}>
        {l.isPending ? 'قيد المراجعة' : (l.is_verified ? 'معتمد' : 'قيد المراجعة')}
      </Badge>
    ) },
    {
      key: 'actions', label: 'إجراء', render: (l) => (
        l.isPending ? (
          <Button
            variant="primary"
            onClick={() => approvePending(l)}
            loading={approving === l.id}
            className="text-xs"
          >
            اعتماد
          </Button>
        ) : (
          <Button variant={l.is_verified ? 'ghost' : 'primary'} onClick={() => toggleVerify(l)} className="text-xs">
            {l.is_verified ? 'إلغاء الاعتماد' : 'اعتماد'}
          </Button>
        )
      ),
    },
  ];

  const handleSearch = (q: string) => {
    setFiltered(rows.filter((l) => {
      const name = l.profile?.full_name || '';
      if (name.includes(q)) return true;
      if (!l.isPending && (l.specialization || '').includes(q)) return true;
      return false;
    }));
  };

  return (
    <DataTable
      title="إدارة المحامين"
      data={filtered}
      columns={columns}
      loading={loading}
      rowKey={(l) => l.id}
      onSearch={handleSearch}
      searchPlaceholder="ابحث بالاسم أو التخصص..."
      emptyTitle="لا يوجد محامون"
      emptyDescription="لم يسجل أي محامٍ بعد"
    />
  );
}
