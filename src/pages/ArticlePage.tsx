import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import type { Law, LawArticle } from '@/types';

const SITE_URL = 'https://sanad1-beryl.vercel.app';

function setMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
) {
  let meta = document.head.querySelector(
    `meta[${attribute}="${key}"]`
  ) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

function setJsonLd(data: Record<string, unknown>) {
  const id = 'sanad-article-jsonld';

  let script = document.getElementById(
    id
  ) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function ArticlePage() {
  const { lawId, articleNumber } = useParams<{
    lawId: string;
    articleNumber: string;
  }>();

  const [law, setLaw] = useState<Law | null>(null);
  const [article, setArticle] = useState<LawArticle | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * ============================================================
   * Load Law + Article
   * ============================================================
   */

  useEffect(() => {
    if (!lawId || !articleNumber) return;

    const loadArticle = async () => {
      setLoading(true);

      const { data: lawData } = await supabase
        .from('laws')
        .select('*')
        .eq('id', lawId)
        .eq('is_published', true)
        .maybeSingle();

      const { data: articleData } = await supabase
        .from('law_articles')
        .select('*')
        .eq('law_id', lawId)
        .eq('article_number', articleNumber)
        .maybeSingle();

      setLaw(lawData as Law | null);
      setArticle(articleData as LawArticle | null);

      setLoading(false);
    };

    loadArticle();
  }, [lawId, articleNumber]);

  /*
   * ============================================================
   * Dynamic SEO
   * ============================================================
   */

  useEffect(() => {
    if (!law || !article || !lawId || !articleNumber) return;

    const articleTitle = article.title
      ? `المادة ${article.article_number} - ${article.title}`
      : `المادة ${article.article_number}`;

    const pageTitle =
      `${articleTitle} | ${law.title} | SANAD`;

    const description =
      `اقرأ ${articleTitle} من ${law.title}. ` +
      `النص القانوني الكامل عبر منصة SANAD للقوانين اليمنية.`;

    const canonicalUrl =
      `${SITE_URL}/laws/${lawId}/article/${encodeURIComponent(
        articleNumber
      )}`;

    /*
     * Basic SEO
     */

    document.title = pageTitle;

    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

    setMetaTag(
      'name',
      'description',
      description
    );

    setMetaTag(
      'name',
      'keywords',
      [
        `المادة ${article.article_number}`,
        `${law.title}`,
        `المادة ${article.article_number} ${law.title}`,
        'القانون اليمني',
        'القوانين اليمنية',
        'مواد القانون اليمني',
        'النصوص القانونية اليمنية',
        'SANAD',
      ].join(', ')
    );

    setMetaTag(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    /*
     * Canonical
     */

    setCanonical(canonicalUrl);

    /*
     * Open Graph
     */

    setMetaTag(
      'property',
      'og:type',
      'article'
    );

    setMetaTag(
      'property',
      'og:title',
      pageTitle
    );

    setMetaTag(
      'property',
      'og:description',
      description
    );

    setMetaTag(
      'property',
      'og:url',
      canonicalUrl
    );

    setMetaTag(
      'property',
      'og:locale',
      'ar_YE'
    );

    setMetaTag(
      'property',
      'og:site_name',
      'SANAD'
    );

    /*
     * Twitter / X
     */

    setMetaTag(
      'name',
      'twitter:card',
      'summary'
    );

    setMetaTag(
      'name',
      'twitter:title',
      pageTitle
    );

    setMetaTag(
      'name',
      'twitter:description',
      description
    );

    /*
     * JSON-LD
     */

    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',

      headline: articleTitle,

      name: articleTitle,

      description,

      url: canonicalUrl,

      inLanguage: 'ar-YE',

      isPartOf: {
        '@type': 'WebPage',
        name: law.title,
        url: `${SITE_URL}/laws/${lawId}`,
      },

      about: {
        '@type': 'Thing',
        name: `${articleTitle} - ${law.title}`,
      },

      publisher: {
        '@type': 'Organization',
        name: 'SANAD',
        url: SITE_URL,
      },

      keywords: [
        `المادة ${article.article_number}`,
        law.title,
        'القانون اليمني',
        'القوانين اليمنية',
        'النصوص القانونية اليمنية',
      ],

      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    });

    return () => {
      const script = document.getElementById(
        'sanad-article-jsonld'
      );

      if (script) {
        script.remove();
      }
    };
  }, [law, article, lawId, articleNumber]);

  /*
   * ============================================================
   * Loading
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  /*
   * ============================================================
   * Article Not Found
   * ============================================================
   */

  if (!law || !article) {
    return (
      <div className="container-page section-padding py-20">

        <EmptyState
          icon={<FileText className="w-16 h-16" />}
          title="المادة غير موجودة"
          description="لم يتم العثور على المادة القانونية المطلوبة."
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

  const articleTitle = article.title
    ? `المادة ${article.article_number} — ${article.title}`
    : `المادة ${article.article_number}`;

  return (
    <main
      className="container-page section-padding py-12"
      dir="rtl"
    >

      {/* =====================================================
          Breadcrumb
         ===================================================== */}

      <nav
        className="mb-6 flex flex-wrap items-center gap-2 text-sm"
        aria-label="مسار التنقل"
      >

        <Link
          to="/laws"
          className="text-navy-500 hover:text-royal-600"
        >
          القوانين اليمنية
        </Link>

        <span>/</span>

        <Link
          to={`/laws/${law.id}`}
          className="text-navy-500 hover:text-royal-600"
        >
          {law.title}
        </Link>

        <span>/</span>

        <span className="text-navy-900 dark:text-white">
          المادة {article.article_number}
        </span>

      </nav>

      {/* =====================================================
          Article
         ===================================================== */}

      <article className="card p-8 md:p-10">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-14 h-14 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">

            <span className="text-gold-700 dark:text-gold-400 font-bold text-lg">
              {article.article_number}
            </span>

          </div>

          <div>

            <p className="text-sm text-navy-400">
              {law.title}
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-navy-900 dark:text-white">
              {articleTitle}
            </h1>

          </div>

        </div>

        <div className="border-t border-navy-100 dark:border-navy-800 pt-7">

          <p className="text-lg leading-9 text-navy-700 dark:text-navy-200 whitespace-pre-line">
            {article.content}
          </p>

        </div>

        <div className="mt-8 pt-6 border-t border-navy-100 dark:border-navy-800">

          <div className="flex items-center gap-2 text-sm text-navy-500">

            <BookOpen className="w-4 h-4" />

            المصدر:
            <Link
              to={`/laws/${law.id}`}
              className="text-royal-600 hover:underline"
            >
              {law.title}
            </Link>

          </div>

        </div>

      </article>

    </main>
  );
}