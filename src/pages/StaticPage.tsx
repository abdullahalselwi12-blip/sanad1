import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ChevronLeft } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import type { Page } from '@/types';

export function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from('pages').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
      setPage(data as Page | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!page) {
    return (
      <div className="container-page section-padding py-20">
        <EmptyState icon={<FileText className="w-16 h-16" />} title="الصفحة غير موجودة" description="الصفحة التي تبحث عنها غير متوفرة" action={<Link to="/" className="btn-primary">العودة للرئيسية</Link>} />
      </div>
    );
  }

  return (
    <div className="container-page section-padding py-12">
      <Link to="/" className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-900 dark:hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> العودة للرئيسية
      </Link>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-6">{page.title}</h1>
        <div className="card p-8">
          <p className="text-navy-700 dark:text-navy-300 leading-relaxed whitespace-pre-line">{page.content}</p>
        </div>
      </div>
    </div>
  );
}
