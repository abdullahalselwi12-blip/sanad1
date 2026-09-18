import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Scale,
  MapPin,
  Star,
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  Bookmark,
  Grid2X2,
  SlidersHorizontal,
} from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import type { Lawyer } from '@/types';

const categories = [
  'جميع المحامين',
  'القانون الجنائي',
  'القانون المدني',
  'الأحوال الشخصية',
  'القانون التجاري',
  'القانون العمالي',
];

export function LawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] =
    useState('جميع المحامين');

  useEffect(() => {
    let cancelled = false;

    const loadLawyers = async () => {
      setLoading(true);

      try {
        /*
         * نفس طريقة LawyerProfilePage
         * لجلب بيانات المحامي والـ profile الحقيقي.
         */
        const { data, error } = await supabase
          .from('lawyers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('is_verified', true)
          .order('created_at', {
            ascending: false,
          });

        if (error) {
          console.error(
            '[LawyersPage] Error loading lawyers:',
            error,
          );

          if (!cancelled) {
            setLawyers([]);
          }

          return;
        }

        /*
         * توحيد profile سواء رجع Object أو Array
         */
        const normalizedLawyers =
          (data || []).map((item: any) => {
            const rawProfile =
              item.profile;

            let profile = null;

            if (Array.isArray(rawProfile)) {
              profile =
                rawProfile.length > 0
                  ? rawProfile[0]
                  : null;
            } else if (
              rawProfile &&
              typeof rawProfile === 'object'
            ) {
              profile = rawProfile;
            }

            return {
              ...item,
              profile,
            };
          }) as Lawyer[];

        console.log(
          '[LawyersPage] Lawyers:',
          normalizedLawyers.length,
        );

        console.log(
          '[LawyersPage] Real names:',
          normalizedLawyers.map(
            (lawyer) =>
              lawyer.profile?.full_name ||
              null,
          ),
        );

        if (!cancelled) {
          setLawyers(normalizedLawyers);
        }
      } catch (error) {
        console.error(
          '[LawyersPage] Unexpected error:',
          error,
        );

        if (!cancelled) {
          setLawyers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLawyers();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * البحث والتصفية
   */
  const filtered = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return lawyers.filter((lawyer) => {
      const name =
        lawyer.profile?.full_name || '';

      const specialization =
        lawyer.specialization || '';

      const bio =
        lawyer.bio || '';

      const searchMatch =
        !normalizedSearch ||
        name
          .toLowerCase()
          .includes(normalizedSearch) ||
        specialization
          .toLowerCase()
          .includes(normalizedSearch) ||
        bio
          .toLowerCase()
          .includes(normalizedSearch);

      if (!searchMatch) {
        return false;
      }

      if (
        activeCategory ===
        'جميع المحامين'
      ) {
        return true;
      }

      const categoryMap: Record<
        string,
        string
      > = {
        'القانون الجنائي': 'جنائي',
        'القانون المدني': 'مدني',
        'الأحوال الشخصية': 'أحوال شخصية',
        'القانون التجاري': 'تجاري',
        'القانون العمالي': 'عمالي',
      };

      const keyword =
        categoryMap[activeCategory];

      if (!keyword) {
        return true;
      }

      return specialization
        .toLowerCase()
        .includes(
          keyword.toLowerCase(),
        );
    });
  }, [
    lawyers,
    search,
    activeCategory,
  ]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-navy-950"
    >
      <div className="container-page section-padding py-10">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-navy-950 to-royal-700 text-white shadow-md">
                <Scale className="h-5 w-5" />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white">
                دليل المحامين
              </h1>

            </div>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              اعثر على محامين معتمدين متخصصين في مختلف المجالات القانونية
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-navy-800 dark:bg-navy-900">

            <span className="text-xs text-navy-500 dark:text-navy-400">
              عدد المحامين
            </span>

            <span className="mx-2 font-extrabold text-navy-900 dark:text-white">
              {filtered.length}
            </span>

          </div>

        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-5">

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-royal-400 focus-within:shadow-md dark:border-navy-800 dark:bg-navy-900">

            <Input
              placeholder="ابحث باسم المحامي أو التخصص..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              icon={
                <Search className="h-5 w-5" />
              }
            />

          </div>

        </div>

        {/* ==================================================
            CATEGORIES
        ================================================== */}

        <div className="mb-7 overflow-x-auto pb-1">

          <div className="flex min-w-max items-center gap-2">

            {categories.map((category) => {

              const active =
                activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category,
                    )
                  }
                  className={[
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200',
                    active
                      ? 'border-navy-950 bg-navy-950 text-white shadow-md dark:border-royal-600 dark:bg-royal-600'
                      : 'border-slate-200 bg-white text-navy-600 hover:border-royal-300 hover:text-royal-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300',
                  ].join(' ')}
                >

                  {category ===
                    'جميع المحامين' ? (
                    <Grid2X2 className="h-3.5 w-3.5" />
                  ) : category ===
                    'القانون الجنائي' ? (
                    <Scale className="h-3.5 w-3.5" />
                  ) : category ===
                    'القانون المدني' ? (
                    <FileText className="h-3.5 w-3.5" />
                  ) : (
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                  )}

                  {category}

                </button>
              );
            })}

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-navy-600 transition hover:border-royal-300 hover:text-royal-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              المزيد
            </button>

          </div>

        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20">

            <Spinner size="lg" />

            <p className="mt-3 text-sm text-navy-500 dark:text-navy-400">
              جاري تحميل المحامين...
            </p>

          </div>

        ) : filtered.length === 0 ? (

          /* ==================================================
             EMPTY
          ================================================== */

          <div className="rounded-2xl border border-slate-200 bg-white py-14 dark:border-navy-800 dark:bg-navy-900">

            <EmptyState
              icon={
                <Scale className="h-14 w-14" />
              }
              title="لا يوجد محامون"
              description="لم نعثر على محامين مطابقين لبحثك"
            />

          </div>

        ) : (

          /* ==================================================
             LAWYERS GRID
          ================================================== */

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filtered.map((lawyer) => {

              /*
               * الاسم الحقيقي من profiles
               */
              const lawyerName =
                lawyer.profile?.full_name?.trim() ||
                'محامٍ';

              const avatar =
                lawyer.profile?.avatar_url ||
                undefined;

              return (

                <article
                  key={lawyer.id}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-royal-300 hover:shadow-xl dark:border-navy-800 dark:bg-navy-900 dark:hover:border-royal-700"
                >

                  {/* Top line */}

                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-navy-950 via-royal-600 to-blue-400" />

                  <div className="p-5">

                    {/* ==================================================
                        VERIFIED + BOOKMARK
                    ================================================== */}

                    <div className="mb-5 flex items-center justify-between">

                      {lawyer.is_verified ? (

                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">

                          <BadgeCheck className="h-3.5 w-3.5" />

                          محامٍ موثق

                        </div>

                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        aria-label="حفظ المحامي"
                        className="rounded-lg p-2 text-navy-400 transition hover:bg-slate-100 hover:text-royal-600 dark:hover:bg-navy-800"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <Bookmark className="h-4.5 w-4.5" />
                      </button>

                    </div>

                    {/* ==================================================
                        PROFILE
                    ================================================== */}

                    <div className="flex items-center gap-3.5">

                      {/* Avatar */}

                      <div className="relative shrink-0">

                        <div className="rounded-full bg-gradient-to-br from-blue-100 to-white p-1 dark:from-blue-950 dark:to-navy-800">

                          <Avatar
                            name={lawyerName}
                            src={avatar}
                            size="lg"
                          />

                        </div>

                        {lawyer.is_verified && (
                          <div className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-sm dark:border-navy-900">

                            <BadgeCheck className="h-3.5 w-3.5" />

                          </div>
                        )}

                      </div>

                      {/* ==================================================
                          REAL LAWYER NAME
                      ================================================== */}

                      <div className="min-w-0 flex-1">

                        <h2 className="truncate text-xl font-extrabold tracking-tight text-navy-950 transition-colors group-hover:text-royal-600 dark:text-white dark:group-hover:text-royal-400">
                          {lawyerName}
                        </h2>

                        {lawyer.specialization && (
                          <div className="mt-1 flex items-center gap-1.5">

                            <Scale className="h-3.5 w-3.5 shrink-0 text-royal-600 dark:text-royal-400" />

                            <p className="truncate text-xs font-medium text-navy-500 dark:text-navy-400">
                              {lawyer.specialization}
                            </p>

                          </div>
                        )}

                        {lawyer.rating != null && (
                          <div className="mt-1.5 flex items-center gap-1">

                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                            <span className="text-xs font-bold text-navy-800 dark:text-navy-200">
                              {Number(
                                lawyer.rating,
                              ).toFixed(1)}
                            </span>

                          </div>
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        BIO
                    ================================================== */}

                    <div className="mt-5 min-h-[60px]">

                      {lawyer.bio ? (

                        <p className="line-clamp-2 text-xs leading-6 text-navy-600 dark:text-navy-300">
                          {lawyer.bio}
                        </p>

                      ) : (

                        <p className="text-xs text-navy-400">
                          لم تتم إضافة نبذة عن المحامي.
                        </p>

                      )}

                    </div>

                    {/* Divider */}

                    <div className="my-4 border-t border-slate-100 dark:border-navy-800" />

                    {/* ==================================================
                        EXPERIENCE
                    ================================================== */}

                    {lawyer.experience_years != null && (
                      <div className="mb-3 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-navy-500 dark:bg-navy-800 dark:text-navy-300">

                            <BriefcaseBusiness className="h-3.5 w-3.5" />

                          </div>

                          <span className="text-xs text-navy-500 dark:text-navy-400">
                            سنوات الخبرة
                          </span>

                        </div>

                        <span className="text-sm font-bold text-navy-900 dark:text-white">
                          {lawyer.experience_years}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        LOCATION
                    ================================================== */}

                    {lawyer.office_address && (
                      <div className="mb-3 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-navy-500 dark:bg-navy-800 dark:text-navy-300">

                            <MapPin className="h-3.5 w-3.5" />

                          </div>

                          <span className="text-xs text-navy-500 dark:text-navy-400">
                            الموقع
                          </span>

                        </div>

                        <span className="max-w-[150px] truncate text-xs font-semibold text-navy-800 dark:text-navy-200">
                          {lawyer.office_address}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        LICENSE
                    ================================================== */}

                    {lawyer.license_number && (
                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-navy-500 dark:bg-navy-800 dark:text-navy-300">

                            <FileText className="h-3.5 w-3.5" />

                          </div>

                          <span className="text-xs text-navy-500 dark:text-navy-400">
                            رقم الرخصة
                          </span>

                        </div>

                        <Badge variant="navy">
                          {lawyer.license_number}
                        </Badge>

                      </div>
                    )}

                    {/* ==================================================
                        SPECIALIZATION
                    ================================================== */}

                    {lawyer.specialization && (
                      <div className="mt-4">

                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                          {lawyer.specialization}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        PROFILE BUTTON
                    ================================================== */}

                    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-navy-800">

                      <Link
                        to={`/lawyers/${lawyer.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-royal-600 hover:shadow-lg dark:bg-royal-600 dark:hover:bg-royal-500"
                      >

                        <span>
                          عرض السيرة الذاتية
                        </span>

                        <span className="transition-transform duration-200 group-hover:-translate-x-1">
                          ←
                        </span>

                      </Link>

                    </div>

                  </div>

                </article>

              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}