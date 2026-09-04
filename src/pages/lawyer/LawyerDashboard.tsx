import { useEffect, useState } from 'react';
import { Briefcase, Users, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
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
    if (!user) return;
    (async () => {
      const { data: lawyerData } = await supabase.from('lawyers').select('*').eq('profile_id', user.id).maybeSingle();
      setLawyer(lawyerData as Lawyer | null);
      if (lawyerData) {
        const { data: cons } = await supabase
          .from('consultations')
          .select('*, profile:profiles(*)')
          .eq('lawyer_id', (lawyerData as Lawyer).id)
          .order('created_at', { ascending: false })
          .limit(10);
        setConsultations((cons || []) as Consultation[]);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const answeredCount = consultations.filter((c) => c.status === 'answered').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">مرحباً، {user?.full_name || user?.email}</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">لوحة تحكم المحامي</p>
      </div>

      {!lawyer && (
        <div className="card p-6 bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800">
          <p className="text-sm text-gold-800 dark:text-gold-300">حسابك كمحامٍ لم يتم اعتماده بعد. سيقوم مدير النظام بمراجعة طلبك واعتماده قريباً.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-3xl font-bold text-navy-900 dark:text-white">{pendingCount}</p><p className="text-sm text-navy-500 mt-1">استشارات قيد الانتظار</p></div>
            <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-gold-600" /></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-3xl font-bold text-navy-900 dark:text-white">{answeredCount}</p><p className="text-sm text-navy-500 mt-1">استشارات تم الرد عليها</p></div>
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-success-600" /></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-3xl font-bold text-navy-900 dark:text-white">{lawyer?.rating ? Number(lawyer.rating).toFixed(1) : '—'}</p><p className="text-sm text-navy-500 mt-1">التقييم</p></div>
            <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center"><Users className="w-6 h-6 text-royal-600" /></div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-navy-900 dark:text-navy-100 mb-4">أحدث الاستشارات الموجهة إليك</h2>
        {consultations.length === 0 ? (
          <EmptyState icon={<MessageSquare className="w-10 h-10" />} title="لا توجد استشارات" description="لم تستلم أي استشارة بعد" />
        ) : (
          <div className="space-y-2">
            {consultations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-50 dark:bg-navy-800/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 dark:text-navy-100 truncate">{c.subject}</p>
                  <p className="text-xs text-navy-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {timeAgo(c.created_at)}</p>
                </div>
                <Badge variant={CONSULTATION_STATUSES[c.status].color}>{CONSULTATION_STATUSES[c.status].label}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
