import { useEffect, useState, useCallback } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { timeAgo } from '@/utils';
import type { Notification } from '@/types';

export function AdminNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as Notification['type'], user_id: '' });
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
    setItems((data || []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    supabase.from('profiles').select('id, email, full_name').then(({ data }) => setUsers((data || []) as typeof users));
  }, [load]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast('العنوان والرسالة مطلوبان', 'error'); return; }
    setSaving(true);
    const payload = { ...form, user_id: form.user_id || null };
    const { error } = await supabase.from('notifications').insert(payload);
    setSaving(false);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم إرسال الإشعار', 'success');
    setShowForm(false);
    setForm({ title: '', message: '', type: 'info', user_id: '' });
    load();
  };

  const handleDelete = async (n: Notification) => {
    const { error } = await supabase.from('notifications').delete().eq('id', n.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف الإشعار', 'success'); load();
  };

  const columns: Column<Notification>[] = [
    { key: 'title', label: 'العنوان', render: (n) => <span className="font-medium text-navy-900 dark:text-navy-100">{n.title}</span> },
    { key: 'message', label: 'الرسالة', render: (n) => <span className="text-xs text-navy-500 line-clamp-1">{n.message}</span> },
    { key: 'type', label: 'النوع', render: (n) => <span className="text-xs">{n.type}</span> },
    { key: 'is_read', label: 'الحالة', render: (n) => <span className="text-xs">{n.is_read ? 'مقروء' : 'غير مقروء'}</span> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (n) => n.created_at, render: (n) => <span className="text-xs">{timeAgo(n.created_at)}</span> },
  ];

  return (
    <>
      <DataTable title="إدارة الإشعارات" data={items} columns={columns} loading={loading} rowKey={(n) => n.id} onAdd={() => setShowForm(true)} onDelete={handleDelete} addLabel="إرسال إشعار" emptyTitle="لا توجد إشعارات" />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="إرسال إشعار" size="md">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="الرسالة" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} required />
          <Select label="النوع" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Notification['type'] })}>
            <option value="info">معلومة</option>
            <option value="success">نجاح</option>
            <option value="warning">تحذير</option>
            <option value="error">خطأ</option>
          </Select>
          <Select label="المستلم (اتركه فارغاً للجميع)" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
            <option value="">جميع المستخدمين</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
          </Select>
          <Button onClick={handleSend} loading={saving} className="w-full">إرسال</Button>
        </div>
      </Modal>
    </>
  );
}
