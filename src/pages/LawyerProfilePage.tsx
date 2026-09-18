import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
  Star,
  User,
  ShieldCheck,
  FileText,
  ChevronLeft,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import type { Lawyer } from '@/types';

export function LawyerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLawyer = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lawyers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', id)
          .eq('is_verified', true)
          .maybeSingle();

        if (error) {
          console.error(
            '[LawyerProfilePage] Error loading lawyer:',
            error
          );

          setLawyer(null);
        } else {
          setLawyer(
            (data || null) as Lawyer | null
          );
        }
      } catch (error) {
        console.error(
          '[LawyerProfilePage] Unexpected error:',
          error
        );

        setLawyer(null);
      } finally {
        setLoading(false);
      }
    };

    loadLawyer();
  }, [id]);

  /* ============================================
     LOADING
  ============================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />

          <p className="text-sm text-navy-500 dark:text-navy-400">
            جاري تحميل بيانات المحامي...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================
     NOT FOUND
  ============================================ */

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
        <div className="container-page section-padding py-20">
          <EmptyState
            icon={
              <Scale className="w-16 h-16" />
            }
            title="المحامي غير موجود"
            description="لم نتمكن من العثور على هذا المحامي أو أن الحساب غير معتمد."
            action={
              <Link
                to="/lawyers"
                className="btn-primary"
              >
                <ArrowRight className="w-4 h-4" />
                العودة إلى دليل المحامين
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  /* ============================================
     REAL PROFILE DATA
  ============================================ */

  const name =
    lawyer.profile?.full_name?.trim() ||
    'محامٍ';

  const email =
    lawyer.profile?.email || null;

  const phone =
    lawyer.profile?.phone || null;

  const avatarUrl =
    lawyer.profile?.avatar_url || undefined;

  const rating =
    lawyer.rating !== null &&
    lawyer.rating !== undefined
      ? Number(lawyer.rating)
      : null;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-navy-950"
    >
      <div className="container-page section-padding py-10">

        {/* ==========================================
            BACK
        ========================================== */}

        <div className="mb-6">
          <Link
            to="/lawyers"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy-500 transition-all hover:bg-white hover:text-royal-600 hover:shadow-sm dark:text-navy-400 dark:hover:bg-navy-900"
          >
            <ArrowRight className="h-4 w-4" />

            العودة إلى دليل المحامين
          </Link>
        </div>

        {/* ==========================================
            PROFILE HERO
        ========================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">

          {/* Background */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-l from-navy-950 via-navy-900 to-royal-800 md:h-56">

            {/* Decorative circles */}
            <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="absolute -right-20 -bottom-40 h-96 w-96 rounded-full bg-royal-500/20 blur-3xl" />

            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            {/* Scale Icon */}
            <div className="absolute left-8 top-8 hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30 backdrop-blur-sm md:flex">
              <Scale className="h-8 w-8" />
            </div>

            {/* Verified Badge */}
            {lawyer.is_verified && (
              <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-md">
                <BadgeCheck className="h-5 w-5 text-blue-300" />
                محامٍ موثق
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-7 md:px-8">

            <div className="-mt-20 flex flex-col gap-6 md:-mt-24 md:flex-row md:items-end">

              {/* Avatar */}
              <div className="relative shrink-0">

                <div className="rounded-full border-[6px] border-white bg-white shadow-2xl dark:border-navy-900 dark:bg-navy-900">
                  <Avatar
                    name={name}
                    src={avatarUrl}
                    size="xl"
                  />
                </div>

                {lawyer.is_verified && (
                  <div className="absolute bottom-2 left-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-white shadow-md dark:border-navy-900">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                )}
              </div>

   <div className="min-w-0 flex-1 pb-1">
  <div className="flex flex-wrap items-center gap-3">

    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
      {name}
    </h1>

    {lawyer.is_verified && (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-royal-600 shadow-sm">
        <ShieldCheck className="h-4 w-4" />
        معتمد
      </div>
    )}

  </div>

  {lawyer.specialization && (
    <div className="mt-2 flex items-center gap-2">
      <Scale className="h-4 w-4 text-blue-300" />

      <p className="text-base font-medium text-blue-100">
        {lawyer.specialization}
      </p>
    </div>
  )}
</div>

              {/* Consultation Button */}
              <div className="pb-1">

                <Link to="/consultations">
                  <Button>
                    <MessageSquare className="h-4 w-4" />

                    طلب استشارة

                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>

              </div>

            </div>

            {/* Quick Stats */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 dark:border-navy-800 md:grid-cols-4">

              {/* Rating */}
              <QuickStat
                icon={
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                }
                label="التقييم"
                value={
                  rating !== null
                    ? rating.toFixed(1)
                    : '—'
                }
              />

              {/* Experience */}
              <QuickStat
                icon={
                  <BriefcaseBusiness className="h-5 w-5 text-royal-600" />
                }
                label="سنوات الخبرة"
                value={
                  lawyer.experience_years !==
                    null &&
                  lawyer.experience_years !==
                    undefined
                    ? `${lawyer.experience_years} سنة`
                    : '—'
                }
              />

              {/* License */}
              <QuickStat
                icon={
                  <FileText className="h-5 w-5 text-royal-600" />
                }
                label="الترخيص"
                value={
                  lawyer.license_number ||
                  'غير محدد'
                }
              />

              {/* Location */}
              <QuickStat
                icon={
                  <MapPin className="h-5 w-5 text-royal-600" />
                }
                label="الموقع"
                value={
                  lawyer.office_address ||
                  'اليمن'
                }
              />

            </div>

          </div>
        </section>

        {/* ==========================================
            MAIN CONTENT
        ========================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ========================================
              LEFT / MAIN
          ======================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* Biography */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 md:p-7">

              <SectionTitle
                icon={
                  <User className="h-5 w-5" />
                }
                title="نبذة عن المحامي"
              />

              {lawyer.bio ? (
                <p className="mt-5 whitespace-pre-line text-sm leading-8 text-navy-600 dark:text-navy-300">
                  {lawyer.bio}
                </p>
              ) : (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center dark:bg-navy-800/60">
                  <p className="text-sm text-navy-400">
                    لم تتم إضافة نبذة تعريفية عن المحامي بعد.
                  </p>
                </div>
              )}

            </section>

            {/* Professional Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 md:p-7">

              <SectionTitle
                icon={
                  <BriefcaseBusiness className="h-5 w-5" />
                }
                title="المعلومات المهنية"
              />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <InfoBox
                  icon={
                    <Scale className="h-5 w-5" />
                  }
                  label="التخصص"
                  value={
                    lawyer.specialization ||
                    'غير محدد'
                  }
                />

                <InfoBox
                  icon={
                    <BriefcaseBusiness className="h-5 w-5" />
                  }
                  label="سنوات الخبرة"
                  value={
                    lawyer.experience_years !==
                      null &&
                    lawyer.experience_years !==
                      undefined
                      ? `${lawyer.experience_years} سنة`
                      : 'غير محدد'
                  }
                />

                <InfoBox
                  icon={
                    <FileText className="h-5 w-5" />
                  }
                  label="رقم الترخيص"
                  value={
                    lawyer.license_number ||
                    'غير محدد'
                  }
                />

                <InfoBox
                  icon={
                    <ShieldCheck className="h-5 w-5" />
                  }
                  label="حالة الاعتماد"
                  value={
                    lawyer.is_verified
                      ? 'محامٍ معتمد وموثق'
                      : 'غير معتمد'
                  }
                  success={
                    lawyer.is_verified
                  }
                />

              </div>

            </section>

          </div>

          {/* ========================================
              SIDEBAR
          ======================================== */}

          <aside className="space-y-6">

            {/* Rating */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900">

              <SectionTitle
                icon={
                  <Star className="h-5 w-5" />
                }
                title="التقييم"
              />

              <div className="mt-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 py-7 dark:from-amber-950/20 dark:to-orange-950/20">

                <div className="text-center">

                  <div className="flex items-center justify-center gap-2">

                    <Star className="h-9 w-9 fill-amber-400 text-amber-400" />

                    <span className="text-4xl font-extrabold text-navy-900 dark:text-white">
                      {rating !== null
                        ? rating.toFixed(1)
                        : '—'}
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-navy-400">
                    تقييم المحامي
                  </p>

                </div>

              </div>

            </section>

            {/* Contact */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900">

              <SectionTitle
                icon={
                  <MessageSquare className="h-5 w-5" />
                }
                title="معلومات التواصل"
              />

              <div className="mt-6 space-y-5">

                {/* Email */}
                {email && (
                  <ContactItem
                    icon={
                      <Mail className="h-5 w-5" />
                    }
                    label="البريد الإلكتروني"
                    value={email}
                  />
                )}

                {/* Phone */}
                {phone && (
                  <ContactItem
                    icon={
                      <Phone className="h-5 w-5" />
                    }
                    label="رقم الهاتف"
                    value={phone}
                    dir="ltr"
                  />
                )}

                {/* Address */}
                {lawyer.office_address && (
                  <ContactItem
                    icon={
                      <MapPin className="h-5 w-5" />
                    }
                    label="عنوان المكتب"
                    value={
                      lawyer.office_address
                    }
                  />
                )}

                {!email &&
                  !phone &&
                  !lawyer.office_address && (
                    <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-navy-800/60">
                      <p className="text-sm text-navy-400">
                        لم تتم إضافة معلومات التواصل بعد.
                      </p>
                    </div>
                  )}

              </div>

            </section>

            {/* License */}
            {lawyer.license_number && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900">

                <SectionTitle
                  icon={
                    <Scale className="h-5 w-5" />
                  }
                  title="الترخيص المهني"
                />

                <div className="mt-5 rounded-2xl bg-navy-50 p-4 dark:bg-navy-800/60">

                  <p className="mb-2 text-xs text-navy-400">
                    رقم الرخصة
                  </p>

                  <div className="flex items-center justify-between gap-3">

                    <span className="font-mono text-sm font-bold text-navy-800 dark:text-navy-100">
                      {lawyer.license_number}
                    </span>

                    <Badge variant="navy">
                      موثق
                    </Badge>

                  </div>

                </div>

              </section>
            )}

            {/* Consultation CTA */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-royal-800 p-6 text-white shadow-lg">

              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

              <div className="relative">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <MessageSquare className="h-6 w-6 text-blue-200" />
                </div>

                <h3 className="text-lg font-bold">
                  تحتاج إلى استشارة قانونية؟
                </h3>

                <p className="mt-2 text-sm leading-7 text-blue-100/80">
                  يمكنك طلب استشارة قانونية من خلال منصة SANAD.
                </p>

                <Link
                  to="/consultations"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-blue-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  طلب استشارة
                </Link>

              </div>

            </section>

          </aside>

        </div>

        {/* ==========================================
            BOTTOM NOTICE
        ========================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-navy-800 dark:bg-navy-900/60">

          <div className="flex items-start gap-3">

            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-royal-600" />

            <p className="text-xs leading-7 text-navy-500 dark:text-navy-400">
              معلومات المحامي المعروضة في هذه الصفحة
              مقدمة من منصة SANAD، ويُنصح بالتحقق من
              التفاصيل قبل طلب أي خدمة قانونية.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ==================================================
   QUICK STAT
================================================== */

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-navy-800/60">

      <div className="mb-2 flex items-center gap-2">
        {icon}

        <span className="text-xs text-navy-400">
          {label}
        </span>
      </div>

      <p className="truncate text-sm font-bold text-navy-800 dark:text-navy-100">
        {value}
      </p>

    </div>
  );
}

/* ==================================================
   SECTION TITLE
================================================== */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-50 text-royal-600 dark:bg-royal-900/20 dark:text-royal-400">
        {icon}
      </div>

      <h2 className="text-lg font-bold text-navy-900 dark:text-white">
        {title}
      </h2>

    </div>
  );
}

/* ==================================================
   INFO BOX
================================================== */

function InfoBox({
  icon,
  label,
  value,
  success = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 transition-colors hover:bg-slate-100 dark:bg-navy-800/60 dark:hover:bg-navy-800">

      <div className="mb-3 flex items-center gap-2">

        <span
          className={
            success
              ? 'text-emerald-500'
              : 'text-royal-600 dark:text-royal-400'
          }
        >
          {icon}
        </span>

        <p className="text-xs text-navy-400">
          {label}
        </p>

      </div>

      <p
        className={
          success
            ? 'text-sm font-bold text-emerald-600 dark:text-emerald-400'
            : 'text-sm font-semibold text-navy-800 dark:text-navy-100'
        }
      >
        {value}
      </p>

    </div>
  );
}

/* ==================================================
   CONTACT ITEM
================================================== */

function ContactItem({
  icon,
  label,
  value,
  dir,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-50 text-royal-600 dark:bg-royal-900/20 dark:text-royal-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="mb-1 text-xs text-navy-400">
          {label}
        </p>

        <p
          dir={dir}
          className="break-words text-sm font-medium text-navy-700 dark:text-navy-200"
        >
          {value}
        </p>

      </div>

    </div>
  );
}