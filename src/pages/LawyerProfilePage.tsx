import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
  Star,
  User,
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

      const { data, error } = await supabase
        .from('lawyers')
        .select('*, profile:profiles(*)')
        .eq('id', id)
        .eq('is_verified', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading lawyer:', error);
        setLawyer(null);
      } else {
        setLawyer((data || null) as Lawyer | null);
      }

      setLoading(false);
    };

    loadLawyer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="container-page section-padding py-16">
        <EmptyState
          icon={<Scale className="w-14 h-14" />}
          title="المحامي غير موجود"
          description="لم نتمكن من العثور على هذا المحامي أو أن الحساب غير معتمد."
          action={
            <Link to="/lawyers" className="btn-primary">
              <ArrowRight className="w-4 h-4" />
              العودة إلى دليل المحامين
            </Link>
          }
        />
      </div>
    );
  }

  const name = lawyer.profile?.full_name || 'محامٍ';
  const email = lawyer.profile?.email;
  const phone = lawyer.profile?.phone;

  return (
    <div className="container-page section-padding py-12">
      {/* Back */}
      <div className="mb-6">
        <Link
          to="/lawyers"
          className="inline-flex items-center gap-2 text-sm text-navy-500 dark:text-navy-400 hover:text-royal-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى دليل المحامين
        </Link>
      </div>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-l from-navy-900 via-navy-800 to-royal-900" />

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14">
            <div className="shrink-0">
              <Avatar
                name={name}
                src={lawyer.profile?.avatar_url}
                size="xl"
                className="ring-4 ring-white dark:ring-navy-900"
              />
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-navy-900 dark:text-white">
                  {name}
                </h1>

                {lawyer.is_verified && (
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-5 h-5 text-royal-500" />
                    <span className="text-xs text-royal-600 dark:text-royal-400">
                      محامٍ معتمد
                    </span>
                  </div>
                )}
              </div>

              {lawyer.specialization && (
                <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                  {lawyer.specialization}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Link to="/consultations">
                <Button>
                  <MessageSquare className="w-4 h-4" />
                  طلب استشارة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Biography */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-royal-600" />
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                نبذة عن المحامي
              </h2>
            </div>

            {lawyer.bio ? (
              <p className="text-sm leading-8 text-navy-600 dark:text-navy-300 whitespace-pre-line">
                {lawyer.bio}
              </p>
            ) : (
              <p className="text-sm text-navy-400">
                لم تتم إضافة نبذة تعريفية عن المحامي بعد.
              </p>
            )}
          </div>

          {/* Professional information */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="w-5 h-5 text-royal-600" />
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                المعلومات المهنية
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBox
                label="التخصص"
                value={lawyer.specialization || 'غير محدد'}
              />

              <InfoBox
                label="سنوات الخبرة"
                value={
                  lawyer.experience_years !== null
                    ? `${lawyer.experience_years} سنة`
                    : 'غير محدد'
                }
              />

              <InfoBox
                label="رقم الترخيص"
                value={lawyer.license_number || 'غير محدد'}
              />

              <div className="rounded-xl bg-navy-50 dark:bg-navy-800/60 p-4">
                <p className="text-xs text-navy-400 mb-2">حالة الاعتماد</p>

                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-success-500" />
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">
                    محامٍ معتمد
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-900 dark:text-white mb-4">
              التقييم
            </h2>

            <div className="flex items-center gap-3">
              <Star className="w-7 h-7 text-gold-500 fill-gold-500" />

              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">
                  {lawyer.rating !== null
                    ? Number(lawyer.rating).toFixed(1)
                    : '—'}
                </p>

                <p className="text-xs text-navy-400">
                  تقييم المحامي
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-900 dark:text-white mb-4">
              معلومات التواصل
            </h2>

            <div className="space-y-4">
              {email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-royal-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-navy-400 mb-1">
                      البريد الإلكتروني
                    </p>
                    <p className="text-sm text-navy-700 dark:text-navy-200 break-all">
                      {email}
                    </p>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-royal-600" />
                  </div>

                  <div>
                    <p className="text-xs text-navy-400 mb-1">
                      رقم الهاتف
                    </p>
                    <p className="text-sm text-navy-700 dark:text-navy-200" dir="ltr">
                      {phone}
                    </p>
                  </div>
                </div>
              )}

              {lawyer.office_address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-royal-600" />
                  </div>

                  <div>
                    <p className="text-xs text-navy-400 mb-1">
                      عنوان المكتب
                    </p>
                    <p className="text-sm leading-6 text-navy-700 dark:text-navy-200">
                      {lawyer.office_address}
                    </p>
                  </div>
                </div>
              )}

              {!email && !phone && !lawyer.office_address && (
                <p className="text-sm text-navy-400">
                  لم تتم إضافة معلومات التواصل بعد.
                </p>
              )}
            </div>
          </div>

          {/* License */}
          {lawyer.license_number && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-royal-600" />
                <h2 className="font-semibold text-navy-900 dark:text-white">
                  الترخيص المهني
                </h2>
              </div>

              <Badge variant="navy">
                رخصة: {lawyer.license_number}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Bottom notice */}
      <div className="mt-6 rounded-xl border border-navy-100 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-900/40 p-4">
        <p className="text-xs leading-6 text-navy-500 dark:text-navy-400 text-center">
          معلومات المحامي المعروضة في هذه الصفحة مقدمة من المنصة،
          ويُنصح بالتحقق من التفاصيل قبل طلب أي خدمة قانونية.
        </p>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-navy-50 dark:bg-navy-800/60 p-4">
      <p className="text-xs text-navy-400 mb-1">
        {label}
      </p>

      <p className="text-sm font-medium text-navy-800 dark:text-navy-200">
        {value}
      </p>
    </div>
  );
}