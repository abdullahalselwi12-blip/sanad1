import { useEffect, useState, useCallback } from 'react';
import { Plus, FileText, ChevronLeft } from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { LAW_CATEGORIES } from '@/constants';
import { formatDate } from '@/utils';
import type { Law, LawArticle, LawCategory } from '@/types';

export function AdminLaws() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editLaw, setEditLaw] = useState<Law | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewArticles, setViewArticles] = useState<Law | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ title: '', category: 'civil' as LawCategory, description: '', issue_date: '', effective_date: '', is_published: true });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('laws').select('*').order('created_at', { ascending: false });
    setLaws((data || []) as Law[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = laws.filter((l) => !search || l.title.includes(search));

  const openAdd = () => {
    setEditLaw(null);
    setFormData({ title: '', category: 'civil', description: '', issue_date: '', effective_date: '', is_published: true });
    setShowForm(true);
  };

  const openEdit = (law: Law) => {
    setEditLaw(law);
    setFormData({
      title: law.title,
      category: law.category,
      description: law.description || '',
      issue_date: law.issue_date || '',
      effective_date: law.effective_date || '',
      is_published: law.is_published,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast('العنوان مطلوب', 'error'); return; }
    setSaving(true);
    const payload = {
      ...formData,
      issue_date: formData.issue_date || null,
      effective_date: formData.effective_date || null,
    };
    if (editLaw) {
      const { error } = await supabase.from('laws').update(payload).eq('id', editLaw.id);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم تحديث القانون', 'success');
    } else {
      const { error } = await supabase.from('laws').insert(payload);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم إضافة القانون', 'success');
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (law: Law) => {
    const { error } = await supabase.from('laws').delete().eq('id', law.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف القانون', 'success');
    load();
  };

  const columns: Column<Law>[] = [
    { key: 'title', label: 'العنوان', sortable: true, sortValue: (l) => l.title, render: (l) => <span className="font-medium text-navy-900 dark:text-navy-100">{l.title}</span> },
    { key: 'category', label: 'التصنيف', render: (l) => <Badge variant="royal">{LAW_CATEGORIES[l.category]}</Badge> },
    { key: 'is_published', label: 'الحالة', render: (l) => <Badge variant={l.is_published ? 'success' : 'navy'}>{l.is_published ? 'منشور' : 'مسودة'}</Badge> },
    { key: 'issue_date', label: 'تاريخ الإصدار', sortable: true, sortValue: (l) => l.issue_date || '', render: (l) => <span className="text-xs">{formatDate(l.issue_date)}</span> },
    {
      key: 'articles', label: 'المواد', render: (l) => (
        <button onClick={() => setViewArticles(l)} className="text-royal-600 hover:text-royal-700 text-sm font-medium flex items-center gap-1">
          <FileText className="w-4 h-4" /> عرض
        </button>
      ),
    },
  ];

  if (viewArticles) {
    return <ArticlesManager law={viewArticles} onBack={() => { setViewArticles(null); load(); }} />;
  }

  return (
    <>
      <DataTable
        title="إدارة القوانين"
        data={filtered}
        columns={columns}
        loading={loading}
        rowKey={(l) => l.id}
        onSearch={setSearch}
        searchPlaceholder="ابحث في القوانين..."
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        addLabel="قانون جديد"
        emptyTitle="لا توجد قوانين"
        emptyDescription="لم تتم إضافة أي قانون بعد"
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editLaw ? 'تعديل القانون' : 'قانون جديد'} size="lg">
        <div className="space-y-4">
          <Input label="عنوان القانون" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Select label="التصنيف" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as LawCategory })}>
            {(Object.entries(LAW_CATEGORIES) as [LawCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Textarea label="الوصف" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ الإصدار" type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} />
            <Input label="تاريخ النفاذ" type="date" value={formData.effective_date} onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4 rounded border-navy-300 text-royal-600 focus:ring-royal-500" />
            <span className="text-sm text-navy-700 dark:text-navy-200">منشور</span>
          </label>
          <Button onClick={handleSave} loading={saving} className="w-full">{editLaw ? 'حفظ التغييرات' : 'إضافة القانون'}</Button>
        </div>
      </Modal>
    </>
  );
}

function ArticlesManager({ law, onBack }: { law: Law; onBack: () => void }) {
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editArticle, setEditArticle] = useState<LawArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ article_number: '', title: '', content: '' });
  const { toast } = useToast();

  const load = useCallback(async () => {
    const { data } = await supabase.from('law_articles').select('*').eq('law_id', law.id).order('article_number', { ascending: true });
    setArticles((data || []) as LawArticle[]);
    setLoading(false);
  }, [law.id]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditArticle(null); setForm({ article_number: '', title: '', content: '' }); setShowForm(true); };
  const openEdit = (a: LawArticle) => { setEditArticle(a); setForm({ article_number: a.article_number, title: a.title || '', content: a.content }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.article_number.trim() || !form.content.trim()) { toast('الرقم والمحتوى مطلوبان', 'error'); return; }
    setSaving(true);
    if (editArticle) {
      const { error } = await supabase.from('law_articles').update(form).eq('id', editArticle.id);
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم تحديث المادة', 'success');
    } else {
      const { error } = await supabase.from('law_articles').insert({ ...form, law_id: law.id });
      if (error) { toast('حدث خطأ', 'error'); setSaving(false); return; }
      toast('تم إضافة المادة', 'success');
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (a: LawArticle) => {
    const { error } = await supabase.from('law_articles').delete().eq('id', a.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف المادة', 'success');
    load();
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-900 dark:hover:text-white mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4" /> العودة للقوانين
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">مواد: {law.title}</h1>
          <p className="text-sm text-navy-500 mt-1">{articles.length} مادة</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> مادة جديدة</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : articles.length === 0 ? (
        <EmptyState icon={<FileText className="w-12 h-12" />} title="لا توجد مواد" description="لم تتم إضافة مواد لهذا القانون" action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> إضافة مادة</Button>} />
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="card p-4 flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                <span className="text-gold-700 dark:text-gold-400 font-bold text-sm">{a.article_number}</span>
              </div>
              <div className="flex-1 min-w-0">
                {a.title && <h3 className="font-semibold text-navy-900 dark:text-navy-100 mb-1">{a.title}</h3>}
                <p className="text-sm text-navy-600 dark:text-navy-300 line-clamp-2">{a.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-royal-50 dark:hover:bg-royal-900/20 text-navy-400 hover:text-royal-600 transition-colors">تعديل</button>
                <button onClick={() => handleDelete(a)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-navy-400 hover:text-error-600 transition-colors">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editArticle ? 'تعديل المادة' : 'مادة جديدة'} size="lg">
        <div className="space-y-4">
          <Input label="رقم المادة" value={form.article_number} onChange={(e) => setForm({ ...form, article_number: e.target.value })} required />
          <Input label="عنوان المادة" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="محتوى المادة" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} required />
          <Button onClick={handleSave} loading={saving} className="w-full">{editArticle ? 'حفظ' : 'إضافة'}</Button>
        </div>
      </Modal>
    </div>
  );
}
