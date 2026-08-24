import { useEffect, useState, useCallback } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { formatDate } from '@/utils';
import type { NewsArticle } from '@/types';

export function AdminNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', image_url: '', is_published: false });
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    setNews((data || []) as NewsArticle[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm({ title: '', excerpt: '', content: '', image_url: '', is_published: false }); setShowForm(true); };
  const openEdit = (n: NewsArticle) => { setEditItem(n); setForm({ title: n.title, excerpt: n.excerpt || '', content: n.content, image_url: n.image_url || '', is_published: n.is_published }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast('العنوان والمحتوى مطلوبان', 'error'); return; }
    setSaving(true);
    const payload = { ...form, published_at: form.is_published ? new Date().toISOString() : null };
    if (editItem) {
      const { error } = await supabase.from('news').update(payload).eq('id', editItem.id);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم تحديث الخبر', 'success');
    } else {
      const { error } = await supabase.from('news').insert(payload);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم إضافة الخبر', 'success');
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (n: NewsArticle) => {
    const { error } = await supabase.from('news').delete().eq('id', n.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف الخبر', 'success'); load();
  };

  const columns: Column<NewsArticle>[] = [
    { key: 'title', label: 'العنوان', sortable: true, sortValue: (n) => n.title, render: (n) => <span className="font-medium text-navy-900 dark:text-navy-100">{n.title}</span> },
    { key: 'excerpt', label: 'المقتطف', render: (n) => <span className="text-xs text-navy-500 line-clamp-1">{n.excerpt || '—'}</span> },
    { key: 'is_published', label: 'الحالة', render: (n) => <Badge variant={n.is_published ? 'success' : 'navy'}>{n.is_published ? 'منشور' : 'مسودة'}</Badge> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (n) => n.created_at, render: (n) => <span className="text-xs">{formatDate(n.created_at)}</span> },
  ];

  return (
    <>
      <DataTable title="إدارة الأخبار" data={news} columns={columns} loading={loading} rowKey={(n) => n.id} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} addLabel="خبر جديد" emptyTitle="لا توجد أخبار" />
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editItem ? 'تعديل الخبر' : 'خبر جديد'} size="lg">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="المقتطف" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
          <Textarea label="المحتوى" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} required />
          <Input label="رابط الصورة" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
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
