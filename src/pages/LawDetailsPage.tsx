import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { LAW_CATEGORIES } from '@/constants';
import { formatDate } from '@/utils';
import type { Law, LawArticle } from '@/types';

export function LawDetailsPage() {
  const { lawId } = useParams<{ lawId: string }>();

  const [law, setLaw] = useState<Law | null>(null);
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lawId) return;

    const loadLaw = async () => {
      setLoading(true);

      const { data: lawData, error: lawError } = await supabase
        .from('laws')
        .select('*')
        .eq('id', lawId)
        .eq('is_published', true)
        .maybeSingle();

      if (!lawError && lawData) {
        setLaw(lawData as Law);

        const { data: articlesData } = await supabase
          .from('law_articles')
          .select('*')
          .eq('law_id', lawId)
          .order('article_number', { ascending: true });

        setArticles((articlesData || []) as LawArticle[]);
      }

      setLoading(false);
    };

    loadLaw();
  }, [lawId]);

  useEffect(() => {
    if (!law) return;

    document.title = `${law.title} | SANAD`;

    const description = law.description
      ? `${law.description} - ${law.title} | SANAD`
      : `استعرض مواد ${law.title} والنصوص القانونية عبر منصة SANAD.`;

    let meta = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description;
  }, [law]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!law) {
    return (
      <div className="container-page section-padding py-20">
        <EmptyState
          icon={<BookOpen className="w-16 h-16" />}
          title="القانون غير موجود"
          description="لم يتم العثور على القانون المطلوب."
        />

        <div className="text-center mt-6">
          <Link
            to="/laws"
            className="inline-flex items-center gap-2 text-royal-600"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى مكتبة القوانين
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container-page section-padding py-12">

      <nav className="mb-6">
        <Link
          to="/laws"
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-royal-600"
        >
          <ArrowRight className="w-4 h-4" />
          مكتبة القوانين
        </Link>
      </nav>

      <header className="card p-8 mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-royal-600" />
          </div>

          <Badge variant="royal">
            {LAW_CATEGORIES[law.category]}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">
          {law.title}
        </h1>

        {law.description && (
          <p className="text-navy-600 dark:text-navy-300 leading-relaxed">
            {law.description}
          </p>
        )}

        <div className="flex flex-wrap gap-5 mt-5 text-sm text-navy-400">

          {law.issue_date && (
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تاريخ الإصدار: {formatDate(law.issue_date)}
            </span>
          )}

          {law.effective_date && (
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تاريخ النفاذ: {formatDate(law.effective_date)}
            </span>
          )}

          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            عدد المواد: {articles.length}
          </span>

        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-5">
          مواد {law.title}
        </h2>

        {articles.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="لا توجد مواد"
            description="لم تتم إضافة مواد لهذا القانون بعد."
          />
        ) : (
          <div className="space-y-4">

            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/laws/${law.id}/article/${encodeURIComponent(
                  article.article_number
                )}`}
                className="card block p-6 hover:shadow-elevated transition-shadow"
              >

                <div className="flex items-start gap-4">

                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                    <span className="text-gold-700 dark:text-gold-400 font-bold">
                      {article.article_number}
                    </span>
                  </div>

                  <div className="flex-1">

                    <h3 className="font-semibold text-lg text-navy-900 dark:text-white mb-2">
                      المادة {article.article_number}
                      {article.title ? ` — ${article.title}` : ''}
                    </h3>

                    <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed line-clamp-3">
                      {article.content}
                    </p>

                    <div className="mt-3 text-sm text-royal-600">
                      قراءة المادة كاملة ←
                    </div>

                  </div>

                </div>

              </Link>
            ))}

          </div>
        )}
      </section>

    </main>
  );
}