import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Scale,
  BookOpen,
  MessageSquare,
  FileText,
  Bot,
  Newspaper,
  Bell,
  TrendingUp,
  ArrowUpLeft,
  Activity,
  PieChart,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';

interface Stats {
  users: number;
  lawyers: number;
  laws: number;
  articles: number;
  consultations: number;
  documents: number;
  conversations: number;
  news: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
  accent: string;
  trend: string;
  path: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        users,
        lawyers,
        laws,
        articles,
        consultations,
        documents,
        conversations,
        news,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('lawyers')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('laws')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('law_articles')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('ai_conversations')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('news')
          .select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: users.count || 0,
        lawyers: lawyers.count || 0,
        laws: laws.count || 0,
        articles: articles.count || 0,
        consultations: consultations.count || 0,
        documents: documents.count || 0,
        conversations: conversations.count || 0,
        news: news.count || 0,
      });
    } catch (error) {
      console.error('Failed to load admin statistics:', error);

      setStats({
        users: 0,
        lawyers: 0,
        laws: 0,
        articles: 0,
        consultations: 0,
        documents: 0,
        conversations: 0,
        news: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * بطاقات الإحصائيات + الصفحات الخاصة بها
   * ============================================================
   *
   * المستخدمون       → /admin/users
   * المحامون         → /admin/lawyers
   * القوانين         → /admin/laws
   * المواد القانونية → /admin/laws
   * الاستشارات       → /admin/consultations
   * الوثائق          → /admin/contracts
   * محادثات الذكاء   → /admin/ai
   * الأخبار          → /admin/news
   */

  const cards: StatCard[] = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: 'المواد القانونية',
        value: stats.articles,
        icon: FileText,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
        accent: 'bg-blue-500',
        trend: 'المحتوى القانوني',
        path: '/admin/laws',
      },

      {
        label: 'القوانين',
        value: stats.laws,
        icon: BookOpen,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
        trend: 'القوانين المنشورة',
        path: '/admin/laws',
      },

      {
        label: 'المحامون',
        value: stats.lawyers,
        icon: Scale,
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
        trend: 'المحامون المعتمدون',
        path: '/admin/lawyers',
      },

      {
        label: 'المستخدمون',
        value: stats.users,
        icon: Users,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
        accent: 'bg-blue-500',
        trend: 'حسابات المنصة',
        path: '/admin/users',
      },

      {
        label: 'الأخبار',
        value: stats.news,
        icon: Newspaper,
        iconBg: 'bg-orange-50 dark:bg-orange-950/40',
        iconColor: 'text-orange-600 dark:text-orange-400',
        accent: 'bg-orange-500',
        trend: 'الأخبار المنشورة',
        path: '/admin/news',
      },

      {
        label: 'محادثات الذكاء',
        value: stats.conversations,
        icon: Bot,
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        accent: 'bg-indigo-500',
        trend: 'المحادثات الذكية',
        path: '/admin/ai',
      },

      {
        label: 'الوثائق',
        value: stats.documents,
        icon: FileText,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
        trend: 'الوثائق المضافة',
        path: '/admin/contracts',
      },

      {
        label: 'الاستشارات',
        value: stats.consultations,
        icon: MessageSquare,
        iconBg: 'bg-orange-50 dark:bg-orange-950/40',
        iconColor: 'text-orange-600 dark:text-orange-400',
        accent: 'bg-orange-500',
        trend: 'الاستشارات القانونية',
        path: '/admin/consultations',
      },
    ];
  }, [stats]);

  const totalContent = useMemo(() => {
    if (!stats) return 0;

    return (
      stats.articles +
      stats.laws +
      stats.lawyers +
      stats.documents +
      stats.news +
      stats.conversations +
      stats.consultations +
      stats.users
    );
  }, [stats]);

  const getPercentage = (value: number) => {
    if (!totalContent) return 0;

    return Math.round((value / totalContent) * 100);
  };

  if (loading || !stats) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-full space-y-6 pb-8"
    >
      {/* =====================================================
          Welcome Banner
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-l from-blue-50 via-white to-slate-50 px-6 py-7 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <div className="pointer-events-none absolute -left-5 -top-8 opacity-[0.07] dark:opacity-[0.04]">
          <Scale className="h-48 w-48 text-blue-700" />
        </div>

        <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="text-center lg:text-right">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
              لوحة إدارة منصة سند
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              مرحباً بك، عبدالله ضياء حسن
              <span className="mr-2">👋</span>
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              هذه نظرة عامة على إحصائيات المنصة ومحتواها
            </p>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-lg font-bold text-slate-800 dark:text-white">
              إدارة أفضل .. نحو عدالة أسهل
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              منصة سند القانونية
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          Page Heading
      ====================================================== */}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            لوحة المعلومات
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            نظرة عامة على إحصائيات المنصة
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <Activity className="h-4 w-4 text-emerald-500" />
          البيانات الحالية
        </div>
      </div>

      {/* =====================================================
          Statistics Cards
      ====================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.label}
              to={card.path}
              aria-label={`الانتقال إلى ${card.label}`}
              className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800"
            >
              {/* Top accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 ${card.accent}`}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {card.value.toLocaleString('ar-EG')}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
                >
                  <Icon
                    className={`h-6 w-6 ${card.iconColor}`}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  نشط
                </div>

                <span className="text-[11px] text-slate-400">
                  {card.trend}
                </span>
              </div>

              {/* Visual bars */}
              <div className="mt-3 flex h-8 items-end gap-1 opacity-50">
                {[35, 55, 45, 70, 50, 80, 65, 90].map(
                  (height, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-sm ${card.accent}`}
                      style={{
                        height: `${Math.max(
                          8,
                          Math.min(
                            100,
                            height * (card.value > 0 ? 1 : 0.2)
                          )
                        )}%`,
                        opacity: 0.15 + index * 0.08,
                      }}
                    />
                  )
                )}
              </div>

              {/* Click hint */}
              <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpLeft className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* =====================================================
          Bottom Dashboard
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* ===================================================
            Activity Chart
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                نظرة عامة على النشاط
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                توزيع محتوى المنصة
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              كل المحتوى
            </div>
          </div>

          <div className="relative h-64">
            <div className="absolute inset-x-0 bottom-8 top-2 flex flex-col justify-between">
              {[40, 30, 20, 10, 0].map((number) => (
                <div
                  key={number}
                  className="flex items-center gap-2"
                >
                  <span className="w-5 text-[10px] text-slate-400">
                    {number}
                  </span>

                  <div className="h-px flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
                </div>
              ))}
            </div>

            <svg
              viewBox="0 0 500 220"
              className="absolute inset-x-8 top-2 h-56 w-[calc(100%-2rem)] overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Users */}
              <polyline
                points="0,175 70,155 140,165 210,125 280,145 350,100 420,125 500,85"
                fill="none"
                stroke="rgb(59 130 246)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* AI */}
              <polyline
                points="0,145 70,125 140,135 210,85 280,110 350,65 420,80 500,45"
                fill="none"
                stroke="rgb(16 185 129)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Consultations */}
              <polyline
                points="0,190 70,185 140,190 210,175 280,180 350,165 420,175 500,160"
                fill="none"
                stroke="rgb(245 158 11)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* User dots */}
              {[
                [0, 175],
                [70, 155],
                [140, 165],
                [210, 125],
                [280, 145],
                [350, 100],
                [420, 125],
                [500, 85],
              ].map(([cx, cy], index) => (
                <circle
                  key={`user-${index}`}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="white"
                  stroke="rgb(59 130 246)"
                  strokeWidth="3"
                />
              ))}

              {/* AI dots */}
              {[
                [0, 145],
                [70, 125],
                [140, 135],
                [210, 85],
                [280, 110],
                [350, 65],
                [420, 80],
                [500, 45],
              ].map(([cx, cy], index) => (
                <circle
                  key={`ai-${index}`}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="white"
                  stroke="rgb(16 185 129)"
                  strokeWidth="3"
                />
              ))}

              {/* Consultation dots */}
              {[
                [0, 190],
                [70, 185],
                [140, 190],
                [210, 175],
                [280, 180],
                [350, 165],
                [420, 175],
                [500, 160],
              ].map(([cx, cy], index) => (
                <circle
                  key={`consult-${index}`}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="white"
                  stroke="rgb(245 158 11)"
                  strokeWidth="3"
                />
              ))}
            </svg>

            <div className="absolute inset-x-8 bottom-0 flex justify-between">
              {[
                'السبت',
                'الأحد',
                'الاثنين',
                'الثلاثاء',
                'الأربعاء',
                'الخميس',
                'الجمعة',
              ].map((day) => (
                <span
                  key={day}
                  className="text-[10px] text-slate-400"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              المستخدمون
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              محادثات الذكاء
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              الاستشارات
            </div>
          </div>
        </div>

        {/* ===================================================
            Donut Chart
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                توزيع المحتوى
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                حسب الأقسام
              </p>
            </div>

            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row xl:flex-col 2xl:flex-row">
            <div className="relative h-48 w-48 shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full -rotate-90"
              >
                {(() => {
                  const values = [
                    stats.articles,
                    stats.laws,
                    stats.lawyers,
                    stats.documents,
                    stats.news,
                    stats.conversations,
                    stats.consultations,
                    stats.users,
                  ];

                  const colors = [
                    'rgb(59 130 246)',
                    'rgb(16 185 129)',
                    'rgb(245 158 11)',
                    'rgb(34 197 94)',
                    'rgb(249 115 22)',
                    'rgb(139 92 246)',
                    'rgb(6 182 212)',
                    'rgb(96 165 250)',
                  ];

                  let offset = 0;

                  return values.map((value, index) => {
                    const percentage =
                      totalContent > 0
                        ? (value / totalContent) * 100
                        : 0;

                    const dash = `${percentage} ${
                      100 - percentage
                    }`;

                    const circle = (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={colors[index]}
                        strokeWidth="13"
                        strokeDasharray={dash}
                        strokeDashoffset={-offset}
                        pathLength="100"
                      />
                    );

                    offset += percentage;

                    return circle;
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalContent.toLocaleString('ar-EG')}
                </span>

                <span className="text-[11px] text-slate-400">
                  إجمالي المحتوى
                </span>
              </div>
            </div>

            <div className="w-full space-y-2">
              {[
                {
                  label: 'المواد القانونية',
                  value: stats.articles,
                  color: 'bg-blue-500',
                },
                {
                  label: 'القوانين',
                  value: stats.laws,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'المحامون',
                  value: stats.lawyers,
                  color: 'bg-amber-500',
                },
                {
                  label: 'الوثائق',
                  value: stats.documents,
                  color: 'bg-green-500',
                },
                {
                  label: 'الأخبار',
                  value: stats.news,
                  color: 'bg-orange-500',
                },
                {
                  label: 'محادثات الذكاء',
                  value: stats.conversations,
                  color: 'bg-violet-500',
                },
                {
                  label: 'الاستشارات',
                  value: stats.consultations,
                  color: 'bg-cyan-500',
                },
                {
                  label: 'المستخدمون',
                  value: stats.users,
                  color: 'bg-blue-400',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                    />

                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.value}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      ({getPercentage(item.value)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================
            Recent Activity
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                آخر الأنشطة
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                ملخص حالة المنصة
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-1">
            <ActivityItem
              icon={Users}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              title="المستخدمون"
              description={`${stats.users} مستخدم في المنصة`}
              value={stats.users}
            />

            <ActivityItem
              icon={MessageSquare}
              iconClass="bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
              title="الاستشارات"
              description={`${stats.consultations} استشارة قانونية`}
              value={stats.consultations}
            />

            <ActivityItem
              icon={FileText}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              title="الوثائق"
              description={`${stats.documents} وثيقة`}
              value={stats.documents}
            />

            <ActivityItem
              icon={Bot}
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
              title="الذكاء الاصطناعي"
              description={`${stats.conversations} محادثة ذكية`}
              value={stats.conversations}
            />

            <ActivityItem
              icon={BookOpen}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              title="المواد القانونية"
              description={`${stats.articles} مادة قانونية`}
              value={stats.articles}
            />

            <ActivityItem
              icon={Bell}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              title="القوانين"
              description={`${stats.laws} قانون`}
              value={stats.laws}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          Quick Overview
      ====================================================== */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                إجمالي الأقسام
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                8
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                إجمالي المحتوى
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {totalContent.toLocaleString('ar-EG')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                حالة النظام
              </p>

              <p className="mt-1 flex items-center gap-1.5 text-xl font-extrabold text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                نشط
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Activity Item
============================================================ */

interface ActivityItemProps {
  icon: typeof Users;
  iconClass: string;
  title: string;
  description: string;
  value: number;
}

function ActivityItem({
  icon: Icon,
  iconClass,
  title,
  description,
  value,
}: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {value}

        <ArrowUpLeft className="h-3 w-3 text-emerald-500" />
      </div>
    </div>
  );
}