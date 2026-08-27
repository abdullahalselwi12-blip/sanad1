import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Scale,
  Bot,
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
} from '@/constants';

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
  const id = 'sanad-home-jsonld';

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

export function HomePage() {
  const { user } = useAuth();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'lawyer'
        ? '/lawyer'
        : '/dashboard';

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useEffect(() => {
    const title =
      'SANAD | المساعد القانوني اليمني والقوانين اليمنية';

    const description =
      'SANAD منصة قانونية يمنية ذكية توفر القوانين اليمنية، المساعد القانوني الذكي، الاستشارات القانونية، الوثائق القانونية، ودليل المحامين في اليمن.';

    const canonicalUrl = `${SITE_URL}/`;

    document.title = title;

    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

    /*
     * Basic SEO
     */

    setMetaTag(
      'name',
      'description',
      description
    );

    setMetaTag(
      'name',
      'keywords',
      'SANAD, القوانين اليمنية, القانون اليمني, المساعد القانوني اليمني, استشارة قانونية في اليمن, استشارة قانونية يمنية, محامي يمني, محامون في اليمن, مواد القانون اليمني, مكتبة القوانين اليمنية, الوثائق القانونية اليمنية'
    );

    setMetaTag(
      'name',
      'author',
      'SANAD'
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
      title
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
      '@type': 'WebSite',

      name: 'SANAD',

      alternateName:
        'المساعد القانوني اليمني',

      url: SITE_URL,

      description,

      inLanguage: 'ar-YE',

      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate:
            `${SITE_URL}/laws?search={search_term_string}`,
        },
        'query-input':
          'required name=search_term_string',
      },

      publisher: {
        '@type': 'Organization',
        name: 'SANAD',
        url: SITE_URL,
      },
    });

    return () => {
      const script = document.getElementById(
        'sanad-home-jsonld'
      );

      if (script) {
        script.remove();
      }
    };
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'مساعد قانوني يمني ذكي',
      desc: 'احصل على إجابات قانونية فورية مبنية على قاعدة بيانات القوانين اليمنية',
    },
    {
      icon: BookOpen,
      title: 'القوانين اليمنية',
      desc: 'تصفح وابحث في القوانين اليمنية وموادها القانونية بسهولة',
    },
    {
      icon: FileText,
      title: 'مولد الوثائق القانونية',
      desc: 'أنشئ وثائق قانونية احترافية بصيغة PDF — عقود، وكالات، إقرارات',
    },
    {
      icon: Users,
      title: 'دليل المحامين في اليمن',
      desc: 'اعثر على محامين معتمدين متخصصين في مختلف المجالات القانونية',
    },
    {
      icon: MessageSquare,
      title: 'استشارات قانونية يمنية',
      desc: 'اطرح سؤالك القانوني واحصل على استشارة من محامٍ مختص',
    },
    {
      icon: Shield,
      title: 'بيانات آمنة',
      desc: 'حماية كاملة لبياناتك مع تشفير على مستوى قاعدة البيانات',
    },
  ];

  const stats = [
    { value: '٥+', label: 'قوانين يمنية' },
    { value: '٢٠+', label: 'مادة قانونية' },
    { value: '٨', label: 'أنواع وثائق' },
    { value: '٢٤/٧', label: 'متاح دائماً' },
  ];

  return (
    <div>

      {/* =====================================================
          Hero
         ===================================================== */}

      <section className="relative gradient-hero text-white overflow-hidden">

        <div className="absolute inset-0 opacity-10">

          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gold-400 blur-3xl" />

          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-royal-400 blur-3xl" />

        </div>

        <div className="relative container-page section-padding py-20 lg:py-32">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-sm mb-6">

              <Sparkles className="w-4 h-4" />

              <span>
                منصة قانونية يمنية 
              </span>

            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">

              المساعد القانوني اليمني
              <br />

              <span className="text-gold-400">
                والقوانين اليمنية
              </span>

            </h1>

            <p className="text-lg lg:text-xl text-navy-200 leading-relaxed mb-8 max-w-2xl">

              {APP_DESCRIPTION}

            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <Link to="/assistant">

                <Button
                  variant="gold"
                  className="text-base px-7 py-3"
                >
                  <Bot className="w-5 h-5" />

                  ابدأ استشارة قانونية

                </Button>

              </Link>

              {!user ? (
                <Link to="/register">

                  <Button
                    variant="secondary"
                    className="text-base px-7 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    إنشاء حساب مجاني
                  </Button>

                </Link>
              ) : null}

            </div>

          </div>

        </div>

        {/* Stats */}

        <div className="relative border-t border-white/10">

          <div className="container-page section-padding py-8">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

              {stats.map((s) => (

                <div
                  key={s.label}
                  className="text-center"
                >

                  <p className="text-3xl font-bold text-gold-400">
                    {s.value}
                  </p>

                  <p className="text-sm text-navy-300 mt-1">
                    {s.label}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          Features
         ===================================================== */}

      <section className="container-page section-padding py-20">

        <div className="text-center mb-12">

          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">

            الخدمات القانونية في SANAD

          </h2>

          <p className="text-navy-500 dark:text-navy-400 max-w-2xl mx-auto">

            منصة قانونية يمنية توفر لك القوانين اليمنية
            والمساعد القانوني والاستشارات والوثائق ودليل المحامين.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((f) => (

            <div
              key={f.title}
              className="card p-6 hover:shadow-elevated transition-shadow group"
            >

              <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">

                <f.icon className="w-6 h-6 text-royal-600 dark:text-royal-400" />

              </div>

              <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2">

                {f.title}

              </h3>

              <p className="text-sm text-navy-500 dark:text-navy-400 leading-relaxed">

                {f.desc}

              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =====================================================
          AI Assistant
         ===================================================== */}

      <section className="container-page section-padding py-20">

        <div className="gradient-royal rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">

          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gold-400/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-sm mb-4">

                <Zap className="w-4 h-4" />

                مدعوم بالذكاء الاصطناعي

              </div>

              <h2 className="text-3xl font-bold mb-4">

                المساعد القانوني اليمني الذكي

              </h2>

              <p className="text-navy-100 leading-relaxed mb-6">

                اطرح سؤالك القانوني بالعربية، وسيقوم
                المساعد الذكي بتحليله والبحث في قاعدة بيانات
                القوانين اليمنية، ثم يعرض لك المادة القانونية
                ذات الصلة مع المصدر والمواد المشابهة.

              </p>

              <Link to="/assistant">

                <Button
                  variant="gold"
                  className="text-base px-6 py-3"
                >

                  جرّب المساعد الآن

                  <ArrowLeft className="w-5 h-5" />

                </Button>

              </Link>

            </div>

            <div className="space-y-3">

              {[
                'تحليل السؤال واستخراج الكلمات المفتاحية',
                'البحث في قاعدة بيانات القوانين اليمنية',
                'عرض المادة القانونية مع المصدر',
                'اقتراح محامٍ متخصص ووثيقة مناسبة',
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
                >

                  <CheckCircle className="w-5 h-5 text-gold-400 shrink-0" />

                  <span className="text-sm">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          How it works
         ===================================================== */}

      <section className="container-page section-padding py-20">

        <div className="text-center mb-12">

          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">

            كيف تعمل منصة SANAD؟

          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              num: '١',
              title: 'أنشئ حساباً',
              desc: 'سجل في المنصة مجاناً واحصل على وصول كامل لجميع الخدمات',
            },
            {
              num: '٢',
              title: 'اطرح سؤالك القانوني',
              desc: 'استخدم المساعد الذكي أو احجز استشارة مع محامٍ معتمد',
            },
            {
              num: '٣',
              title: 'احصل على إجابتك',
              desc: 'استقبل إجابة قانونية مبنية على القوانين اليمنية مع المصادر',
            },
          ].map((step) => (

            <div
              key={step.num}
              className="text-center"
            >

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-500 to-navy-700 text-white text-2xl font-bold mb-4">

                {step.num}

              </div>

              <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2">

                {step.title}

              </h3>

              <p className="text-sm text-navy-500 dark:text-navy-400">

                {step.desc}

              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =====================================================
          Final CTA
         ===================================================== */}

      <section className="container-page section-padding py-20">

        <div className="card p-8 lg:p-12 text-center bg-gradient-to-br from-navy-50 to-royal-50 dark:from-navy-900 dark:to-navy-800">

          <Scale className="w-12 h-12 text-royal-600 mx-auto mb-4" />

          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">

            ابدأ باستخدام المساعد القانوني اليمني

          </h2>

          <p className="text-navy-500 dark:text-navy-400 mb-8 max-w-xl mx-auto">

            انضم إلى {APP_NAME} اليوم واحصل على
            استشارات قانونية ذكية، وثائق قانونية،
            ودليل محامين معتمدين.

          </p>

          {!user ? (
            <Link to="/register">

              <Button
                variant="primary"
                className="text-base px-8 py-3"
              >
                إنشاء حساب مجاني
              </Button>

            </Link>
          ) : (
            <Link to={dashboardPath}>

              <Button
                variant="primary"
                className="text-base px-8 py-3"
              >
                الذهاب إلى لوحة التحكم
              </Button>

            </Link>
          )}

        </div>

      </section>

    </div>
  );
}