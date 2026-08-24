import { useEffect, useState, useCallback } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { formatDate, slugify } from '@/utils';
import type { Page } from '@/types';

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: '', title: '', content: '', is_published: true });
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
    setPages((data || []) as Page[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm({ slug: '', title: '', content: '', is_published: true }); setShowForm(true); };
  const openEdit = (p: Page) => { setEditItem(p); setForm({ slug: p.slug, title: p.title, content: p.content, is_published: p.is_published }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast('العنوان والمحتوى مطلوبان', 'error'); return; }
    const slug = form.slug || slugify(form.title);
    setSaving(true);
    if (editItem) {
      const { error } = await supabase.from('pages').update({ ...form, slug }).eq('id', editItem.id);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم تحديث الصفحة', 'success');
    } else {
      const { error } = await supabase.from('pages').insert({ ...form, slug });
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم إضافة الصفحة', 'success');
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (p: Page) => {
    const { error } = await supabase.from('pages').delete().eq('id', p.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف الصفحة', 'success'); load();
  };

  const columns: Column<Page>[] = [
    { key: 'title', label: 'العنوان', sortable: true, sortValue: (p) => p.title, render: (p) => <span className="font-medium text-navy-900 dark:text-navy-100">{p.title}</span> },
    { key: 'slug', label: 'المعرّف', render: (p) => <code className="text-xs text-royal-600 dark:text-royal-400">/{p.slug}</code> },
    { key: 'is_published', label: 'الحالة', render: (p) => <Badge variant={p.is_published ? 'success' : 'navy'}>{p.is_published ? 'منشور' : 'مسودة'}</Badge> },
    { key: 'updated_at', label: 'آخر تحديث', sortable: true, sortValue: (p) => p.updated_at, render: (p) => <span className="text-xs">{formatDate(p.updated_at)}</span> },
  ];

  return (
    <>
      <DataTable title="إدارة الصفحات" data={pages} columns={columns} loading={loading} rowKey={(p) => p.id} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} addLabel="صفحة جديدة" emptyTitle="لا توجد صفحات" />
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editItem ? 'تعديل الصفحة' : 'صفحة جديدة'} size="lg">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} required />
          <Input label="المعرّف (slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about" />
          <Textarea label="المحتوى" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-navy-300 text-royal-600 focus:ring-royal-500" />
            <span className="text-sm text-navy-700 dark:text-navy-200">منشور</span>
          </label>
          <Button onClick={handleSave} loading={saving} className="w-full">{editItem ? 'حفظ' : 'إضافة'}</Button>
        </div>
      </Modal>
    </>
  );
}
