import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase';
import { fetchConsultations, createConsultation } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Consultation, Lawyer } from '@/types';

export function ConsultationsPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [lawyerId, setLawyerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [lawyerResult, consultResult] = await Promise.allSettled([
        supabase.from('lawyers').select('*, profile:profiles(*)').eq('is_verified', true),
        user ? fetchConsultations({ limit: 100 }) : Promise.resolve({ data: [] as Consultation[], pagination: { page: 1, limit: 100, total: 0, total_pages: 0, has_next: false, has_prev: false } }),
      ]);

      if (!cancelled) {
        if (lawyerResult.status === 'fulfilled') {
          setLawyers((lawyerResult.value.data || []) as Lawyer[]);
        }
        if (consultResult.status === 'fulfilled') {
          setConsultations(consultResult.value.data);
        } else if (user) {
          setConsultations([]);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('يجب تسجيل الدخول لإرسال استشارة', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await createConsultation({
        subject,
        question,
        lawyer_id: lawyerId || undefined,
      });
      toast('تم إرسال استشارتك بنجاح', 'success');
      setSubject('');
      setQuestion('');
      setLawyerId('');
      const result = await fetchConsultations({ limit: 100 });
      setConsultations(result.data);
    } catch {
      toast('حدث خطأ أثناء إرسال الاستشارة', 'error');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="container-page section-padding py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">الاستشارات القانونية</h1>
        <p className="text-navy-500 dark:text-navy-400">اطرح سؤالك القانوني واحصل على استشارة من محامٍ معتمد</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">استشارة جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="موضوع الاستشارة"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="مثال: نزاع على عقار"
            />
            <Textarea
              label="سؤالك"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={5}
              placeholder="اكتب سؤالك القانوني بالتفصيل..."
            />
            <Select label="اختر محامياً (اختياري)" value={lawyerId} onChange={(e) => setLawyerId(e.target.value)}>
              <option value="">استشارة عامة</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>{l.profile?.full_name} — {l.specialization}</option>
              ))}
            </Select>
            <Button type="submit" loading={submitting} className="w-full">
              <Send className="w-4 h-4" /> إرسال الاستشارة
            </Button>
          </form>
        </div>

        {/* My consultations */}
        <div>
          <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">استشاراتي</h2>
          {!user ? (
            <EmptyState icon={<MessageSquare className="w-12 h-12" />} title="سجل الدخول" description="يجب تسجيل الدخول لعرض استشاراتك" />
          ) : consultations.length === 0 ? (
            <EmptyState icon={<MessageSquare className="w-12 h-12" />} title="لا توجد استشارات" description="لم ترسل أي استشارة بعد" />
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => {
                const status = CONSULTATION_STATUSES[c.status];
                return (
                  <div key={c.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-navy-900 dark:text-navy-100">{c.subject}</h3>
                      <Badge variant={status.color}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-navy-600 dark:text-navy-300 mb-2 line-clamp-2">{c.question}</p>
                    {c.answer && (
                      <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-3 mb-2">
                        <p className="text-sm text-success-700 dark:text-success-300">{c.answer}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-navy-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(c.created_at)}</span>
                      {c.lawyer && <span>المحامي: {c.lawyer.profile?.full_name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
