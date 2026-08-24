import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { ROLES } from '@/constants';
import { formatDate } from '@/utils';
import type { Profile, UserRole } from '@/types';

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data || []) as Profile[]);
    setFiltered((data || []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    setFiltered(users.filter((u) => (u.email + (u.full_name || '')).toLowerCase().includes(search.toLowerCase())));
  }, [search, users]);

  const handleEdit = (u: Profile) => {
    setEditUser(u);
    setEditRole(u.role);
    setEditActive(u.is_active);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ role: editRole, is_active: editActive }).eq('id', editUser.id);
    setSaving(false);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم تحديث المستخدم', 'success');
    setEditUser(null);
    load();
  };

  const columns: Column<Profile>[] = [
    {
      key: 'name', label: 'المستخدم', render: (u) => (
        <div className="flex items-center gap-2">
          <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
          <div>
            <p className="font-medium text-navy-900 dark:text-navy-100">{u.full_name || 'بدون اسم'}</p>
            <p className="text-xs text-navy-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'الدور', render: (u) => <Badge variant={u.role === 'admin' ? 'gold' : u.role === 'lawyer' ? 'royal' : 'navy'}>{ROLES[u.role]}</Badge> },
    { key: 'phone', label: 'الهاتف', render: (u) => <span className="text-xs">{u.phone || '—'}</span> },
    { key: 'is_active', label: 'الحالة', render: (u) => <Badge variant={u.is_active ? 'success' : 'error'}>{u.is_active ? 'نشط' : 'محظور'}</Badge> },
    { key: 'created_at', label: 'تاريخ التسجيل', sortable: true, sortValue: (u) => u.created_at, render: (u) => <span className="text-xs">{formatDate(u.created_at)}</span> },
  ];

  return (
    <>
      <DataTable
        title="إدارة المستخدمين"
        data={filtered}
        columns={columns}
        loading={loading}
        rowKey={(u) => u.id}
        onSearch={setSearch}
        searchPlaceholder="ابحث بالاسم أو البريد..."
        onEdit={handleEdit}
        emptyTitle="لا يوجد مستخدمون"
        emptyDescription="لم يتم تسجيل أي مستخدم بعد"
      />

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="تعديل المستخدم" size="sm">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 dark:bg-navy-800">
              <Avatar name={editUser.full_name} src={editUser.avatar_url} size="md" />
              <div><p className="font-medium text-navy-900 dark:text-navy-100">{editUser.full_name}</p><p className="text-xs text-navy-400">{editUser.email}</p></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">الدور</label>
              <div className="grid grid-cols-3 gap-2">
                {(['user', 'lawyer', 'admin'] as UserRole[]).map((r) => (
                  <button key={r} onClick={() => setEditRole(r)} className={`p-2 rounded-lg text-sm font-medium transition-colors ${editRole === r ? 'bg-royal-600 text-white' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}>
                    {ROLES[r]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">الحالة</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setEditActive(true)} className={`p-2 rounded-lg text-sm font-medium transition-colors ${editActive ? 'bg-success-600 text-white' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}>نشط</button>
                <button onClick={() => setEditActive(false)} className={`p-2 rounded-lg text-sm font-medium transition-colors ${!editActive ? 'bg-error-600 text-white' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}>محظور</button>
              </div>
            </div>
            <Button onClick={handleSave} loading={saving} className="w-full">حفظ التغييرات</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
