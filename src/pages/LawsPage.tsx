import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FileText,
  Calendar,
} from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { LAW_CATEGORIES } from '@/constants';
import { formatDate } from '@/utils';

import type { Law, LawCategory } from '@/types';

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
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', url);
}

function setJsonLd(data: Record<string, unknown>) {
  const id = 'sanad-laws-jsonld';

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

export function LawsPage() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] =
    useState<LawCategory | 'all'>('all');

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useEffect(() => {
    const title =
      'القوانين اليمنية | مكتبة القوانين اليمنية - SANAD';

    const description =
      'مكتبة القوانين اليمنية في SANAD. ابحث وتصفح القوانين اليمنية والمواد القانونية في مجالات القانون المدني والجنائي والتجاري والأسرة والعمل وغيرها.';

    document.title = title;

    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

    setMetaTag('name', 'description', description);

    setMetaTag(
      'name',
      'keywords',
      'القوانين اليمنية, القانون اليمني, قوانين اليمن, مواد القانون اليمني, مكتبة القوانين اليمنية, قانون العمل اليمني, القانون المدني اليمني, القانون الجنائي اليمني, القانون التجاري اليمني, الأحوال الشخصية اليمنية, SANAD'
    );

    setMetaTag(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    setMetaTag(
      'property',
      'og:type',
      'website'
    );

    setMetaTag(
      'property',
      'og:title',
      title
    );

    setMetaTag(
      'property',
      'og:description',
      description
    );

    setMetaTag(
      'property',
      'og:url',
      `${SITE_URL}/laws`
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

    setMetaTag(
      'name',
      'twitter:card',
      'summary'
    );

    setMetaTag(
      'name',
      'twitter:title',
      title
    );

    setMetaTag(
      'name',
      'twitter:description',
      description
    );

    setCanonical(`${SITE_URL}/laws`);

    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `${SITE_URL}/laws`,
      inLanguage: 'ar-YE',
      isPartOf: {
        '@type': 'WebSite',
        name: 'SANAD',
        url: SITE_URL,
      },
      about: {
        '@type': 'Thing',
        name: 'القوانين اليمنية',
      },
    });

    return () => {
      const script = document.getElementById(
        'sanad-laws-jsonld'
      );

      if (script) {
        script.remove();
      }
    };
  }, []);

  /*
   * ============================================================
   * Load Laws
   * ============================================================
   */

  useEffect(() => {
    (async () => {
      setLoading(true);

      let query = supabase
        .from('laws')
        .select('*')
        .eq('is_published', true)
        .order('created_at', {
          ascending: false,
        });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        setLaws(data as Law[]);
      } else {
        setLaws([]);
      }

      setLoading(false);
    })();
  }, [search, category]);

  return (
    <main
      className="container-page section-padding py-12"
      dir="rtl"
    >
      {/* =====================================================
          SEO-friendly Page Header
         ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          القوانين اليمنية
        </h1>

        <p className="text-navy-500 dark:text-navy-400">
          مكتبة القوانين اليمنية وموادها القانونية
        </p>
      </div>

      {/* =====================================================
          Search & Categories
         ===================================================== */}

      <div className="mb-6 space-y-4">

        {/* Search */}

        <Input
          placeholder="ابحث في القوانين اليمنية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Categories */}

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              category === 'all'
                ? 'bg-royal-600 text-white'
                : 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300 hover:bg-navy-200'
            }`}
          >
            الكل
          </button>

          {(
            Object.entries(LAW_CATEGORIES) as [
              LawCategory,
              string
            ][]
          ).map(([key, label]) => (

            <button
              type="button"
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-royal-600 text-white'
                  : 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300 hover:bg-navy-200'
              }`}
            >
              {label}
            </button>

          ))}

        </div>

      </div>

      {/* =====================================================
          Loading
         ===================================================== */}

      {loading ? (

        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>

      ) : laws.length === 0 ? (

        /* ===================================================
           Empty State
           =================================================== */

        <EmptyState
          icon={<BookOpen className="w-16 h-16" />}
          title="لا توجد قوانين"
          description="لم نعثر على قوانين مطابقة لبحثك"
        />

      ) : (

        /* ===================================================
           Laws Grid
           =================================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {laws.map((law) => (

            <Link
              key={law.id}
              to={`/laws/${law.id}`}
              className="card block p-6 text-right hover:shadow-elevated transition-shadow group"
            >

              {/* Top */}

              <div className="flex items-start justify-between mb-3">

                <div className="w-10 h-10 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center">

                  <BookOpen
                    className="w-5 h-5 text-royal-600 dark:text-royal-400"
                  />

                </div>

                <Badge variant="royal">
                  {LAW_CATEGORIES[law.category]}
                </Badge>

              </div>

              {/* Law title */}

              <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2 group-hover:text-royal-600 transition-colors">

                {law.title}

              </h2>

              {/* Description */}

              {law.description && (

                <p className="text-sm text-navy-500 dark:text-navy-400 line-clamp-2 mb-3">

                  {law.description}

                </p>

              )}

              {/* Information */}

              <div className="flex items-center gap-4 text-xs text-navy-400">

                {law.issue_date && (

                  <span className="flex items-center gap-1">

                    <Calendar className="w-3.5 h-3.5" />

                    {formatDate(law.issue_date)}

                  </span>

                )}

                <span className="flex items-center gap-1">

                  <FileText className="w-3.5 h-3.5" />

                  عرض المواد القانونية

                </span>

              </div>

            </Link>

          ))}

        </div>

      )}

    </main>
  );
}