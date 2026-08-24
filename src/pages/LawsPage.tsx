import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, FileText, ChevronLeft, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { LAW_CATEGORIES } from '@/constants';
import { formatDate } from '@/utils';
import type { Law, LawCategory } from '@/types';

export function LawsPage() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LawCategory | 'all'>('all');
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from('laws').select('*').eq('is_published', true).order('created_at', { ascending: false });
      if (category !== 'all') query = query.eq('category', category);
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      const { data, error } = await query;
      if (!error && data) setLaws(data as Law[]);
      setLoading(false);
    })();
  }, [search, category]);

  if (selectedLaw) {
    return <LawDetail law={selectedLaw} onBack={() => setSelectedLaw(null)} />;
  }

  return (
    <div className="container-page section-padding py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">مكتبة القوانين</h1>
        <p className="text-navy-500 dark:text-navy-400">تصفح وابحث في القوانين اليمنية وموادها القانونية</p>
      </div>

      <div className="mb-6 space-y-4">
        <Input
          placeholder="ابحث في القوانين..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === 'all' ? 'bg-royal-600 text-white' : 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300 hover:bg-navy-200'}`}
          >
            الكل
          </button>
          {(Object.entries(LAW_CATEGORIES) as [LawCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === key ? 'bg-royal-600 text-white' : 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300 hover:bg-navy-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : laws.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-16 h-16" />} title="لا توجد قوانين" description="لم نعثر على قوانين مطابقة لبحثك" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {laws.map((law) => (
            <button
              key={law.id}
              onClick={() => setSelectedLaw(law)}
              className="card p-6 text-right hover:shadow-elevated transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-royal-600 dark:text-royal-400" />
                </div>
                <Badge variant="royal">{LAW_CATEGORIES[law.category]}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2 group-hover:text-royal-600 transition-colors">
                {law.title}
              </h3>
              {law.description && <p className="text-sm text-navy-500 dark:text-navy-400 line-clamp-2 mb-3">{law.description}</p>}
              <div className="flex items-center gap-4 text-xs text-navy-400">
                {law.issue_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(law.issue_date)}</span>}
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> عرض المواد</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LawDetail({ law, onBack }: { law: Law; onBack: () => void }) {
  const [articles, setArticles] = useState<Law['articles']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('law_articles')
        .select('*')
        .eq('law_id', law.id)
        .order('article_number', { ascending: true });
      setArticles((data || []) as unknown as Law['articles']);
      setLoading(false);
    })();
  }, [law.id]);

  return (
    <div className="container-page section-padding py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-900 dark:hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> العودة للقوانين
      </button>

      <div className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="royal">{LAW_CATEGORIES[law.category]}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-3">{law.title}</h1>
        {law.description && <p className="text-navy-600 dark:text-navy-300 leading-relaxed">{law.description}</p>}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-navy-400">
          {law.issue_date && <span>تاريخ الإصدار: {formatDate(law.issue_date)}</span>}
          {law.effective_date && <span>تاريخ النفاذ: {formatDate(law.effective_date)}</span>}
        </div>
      </div>

      <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">المواد القانونية</h2>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : articles && articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                  <span className="text-gold-700 dark:text-gold-400 font-bold text-sm">{article.article_number}</span>
                </div>
                <div className="flex-1">
                  {article.title && <h3 className="font-semibold text-navy-900 dark:text-navy-100 mb-1">{article.title}</h3>}
                  <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed">{article.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<FileText className="w-12 h-12" />} title="لا توجد مواد" description="لم تتم إضافة مواد لهذا القانون بعد" />
      )}
    </div>
  );
}
