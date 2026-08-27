import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronLeft,
} from 'lucide-react';

import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';

import type { Consultation, Lawyer } from '@/types';

export function LawyerDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        /*
         * الحصول على بيانات المحامي الحالي
         */
        const { data: lawyerData } = await supabase
          .from('lawyers')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();

        setLawyer(lawyerData as Lawyer | null);

        /*
         * إذا لم يكن المستخدم مسجلاً كمحامي
         */
        if (!lawyerData) {
          setConsultations([]);
          setLoading(false);
          return;
        }

        /*
         * جلب أحدث الاستشارات الخاصة بالمحامي
         */
        const { data: consultationsData } = await supabase
          .from('consultations')
          .select('*')
          .eq('lawyer_id', lawyerData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setConsultations(
          (consultationsData || []) as Consultation[]
        );
      } catch (error) {
        console.error('Lawyer dashboard error:', error);
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  /*
   * الإحصائيات
   */
  const pendingCount = consultations.filter(
    (c) => c.status === 'pending'
  ).length;

  const answeredCount = consultations.filter(
    (c) => c.status === 'answered'
  ).length;

  const closedCount = consultations.filter(
    (c) => c.status === 'closed'
  ).length;

  /*
   * التقييم
   */
  const rating =
    lawyer?.rating !== undefined && lawyer?.rating !== null
      ? Number(lawyer.rating).toFixed(1)
      : '—';

  return (
    <div className="space-y-8">

      {/* =========================================================
          Header
      ========================================================= */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-royal-600 dark:text-royal-400 mb-1">
            لوحة المحامي
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            مرحباً، {user?.full_name || user?.email}
          </h1>

          <p className="text-sm text-navy-500 dark:text-navy-400 mt-2">
            تابع استشاراتك ورسائل العملاء من مكان واحد.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Link to="/lawyer/settings">
            <Button variant="secondary">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
          </Link>

          <Link to="/lawyer/consultations">
            <Button>
              <MessageSquare className="w-4 h-4" />
              الاستشارات
            </Button>
          </Link>

        </div>
      </div>


      {/* =========================================================
          Lawyer verification
      ========================================================= */}
      {!lawyer && (
        <div className="card p-6 border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-gold-600" />
            </div>

            <div>
              <h2 className="font-semibold text-gold-900 dark:text-gold-200">
                حساب المحامي قيد المراجعة
              </h2>

              <p className="text-sm text-gold-800 dark:text-gold-300 mt-1 leading-6">
                لم يتم اعتماد حسابك كمحامٍ حتى الآن.
                سيقوم مدير النظام بمراجعة بياناتك واعتماد الحساب.
              </p>
            </div>

          </div>
        </div>
      )}


      {/* =========================================================
          Statistics
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Pending */}
        <Link
          to="/lawyer/consultations"
          className="card p-5 group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-3xl font-bold text-navy-900 dark:text-white">
                {pendingCount}
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                قيد الانتظار
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-gold-600" />
            </div>

          </div>

          <div className="flex items-center gap-1 text-xs text-royal-600 dark:text-royal-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            عرض الاستشارات
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>


        {/* Answered */}
        <Link
          to="/lawyer/consultations"
          className="card p-5 group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-3xl font-bold text-navy-900 dark:text-white">
                {answeredCount}
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                تم الرد عليها
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>

          </div>

          <div className="flex items-center gap-1 text-xs text-royal-600 dark:text-royal-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            عرض الاستشارات
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>


        {/* Closed */}
        <Link
          to="/lawyer/consultations"
          className="card p-5 group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-3xl font-bold text-navy-900 dark:text-white">
                {closedCount}
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                استشارات مغلقة
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-navy-600 dark:text-navy-300" />
            </div>

          </div>

          <div className="flex items-center gap-1 text-xs text-royal-600 dark:text-royal-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            عرض الاستشارات
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>


        {/* Rating */}
        <div className="card p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-3xl font-bold text-navy-900 dark:text-white">
                {rating}
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                تقييم المحامي
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-royal-600" />
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          Quick action
      ========================================================= */}
      <div className="card overflow-hidden">

        <div className="p-6 bg-gradient-to-l from-royal-700 to-royal-600 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">
                  إدارة الاستشارات
                </span>
              </div>

              <p className="text-sm text-white/80 leading-6">
                افتح قائمة الاستشارات للتواصل مع العملاء والرد على أسئلتهم.
              </p>
            </div>

            <Link to="/lawyer/consultations">
              <Button
                variant="secondary"
                className="bg-white text-navy-900 hover:bg-navy-50 border-0"
              >
                فتح الاستشارات
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

          </div>

        </div>
      </div>


      {/* =========================================================
          Latest consultations
      ========================================================= */}
      <div className="card p-5 sm:p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="font-bold text-lg text-navy-900 dark:text-white">
              أحدث الاستشارات
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
              آخر الاستشارات الموجهة إليك
            </p>
          </div>

          {consultations.length > 0 && (
            <Link
              to="/lawyer/consultations"
              className="flex items-center gap-1 text-sm font-medium text-royal-600 hover:text-royal-700 dark:text-royal-400"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}

        </div>


        {!lawyer ? (
          <EmptyState
            icon={<MessageSquare className="w-10 h-10" />}
            title="لا توجد بيانات للمحامي"
            description="سيظهر هنا نشاط حسابك بعد اعتماد ملف المحامي."
          />
        ) : consultations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-10 h-10" />}
            title="لا توجد استشارات بعد"
            description="عندما يتم توجيه استشارة إليك ستظهر هنا."
          />
        ) : (
          <div className="space-y-2">

            {consultations.slice(0, 5).map((consultation) => {

              const status =
                CONSULTATION_STATUSES[consultation.status] || {
                  label: consultation.status,
                  color: 'default',
                };

              return (
                <Link
                  key={consultation.id}
                  to="/lawyer/consultations"
                  className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 dark:bg-navy-800/50 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors group"
                >

                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-royal-600" />
                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold text-navy-900 dark:text-navy-100 truncate">
                      {consultation.subject}
                    </p>

                    <div className="flex items-center gap-2 mt-1">

                      <p className="text-xs text-navy-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(consultation.created_at)}
                      </p>

                    </div>

                  </div>


                  <Badge variant={status.color}>
                    {status.label}
                  </Badge>


                  <ChevronLeft className="w-4 h-4 text-navy-300 group-hover:text-royal-500 transition-colors shrink-0" />

                </Link>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}