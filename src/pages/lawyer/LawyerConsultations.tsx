import { useEffect, useState } from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Consultation, Lawyer } from '@/types';

export function LawyerConsultations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: lawyerData } = await supabase.from('lawyers').select('*').eq('profile_id', user.id).maybeSingle();
      setLawyer(lawyerData as Lawyer | null);
      if (lawyerData) {
        const { data } = await supabase.from('consultations').select('*, profile:profiles(*)').eq('lawyer_id', (lawyerData as Lawyer).id).order('created_at', { ascending: false });
        setItems((data || []) as Consultation[]);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleAnswer = async (id: string) => {
    if (!answer.trim()) return;
    const { error } = await supabase.from('consultations').update({ answer, status: 'answered' }).eq('id', id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم إرسال الرد', 'success');
    setAnswering(null);
    setAnswer('');
    setItems((items) => items.map((c) => c.id === id ? { ...c, answer, status: 'answered' } : c));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">الاستشارات</h1>
      {items.length === 0 ? (
        <EmptyState icon={<MessageSquare className="w-12 h-12" />} title="لا توجد استشارات" description="لم تستلم أي استشارة بعد" />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-navy-900 dark:text-navy-100">{c.subject}</h3>
                  <p className="text-xs text-navy-400 mt-0.5">من: {c.profile?.full_name || c.profile?.email} — {timeAgo(c.created_at)}</p>
                </div>
                <Badge variant={CONSULTATION_STATUSES[c.status].color}>{CONSULTATION_STATUSES[c.status].label}</Badge>
              </div>
              <p className="text-sm text-navy-600 dark:text-navy-300 mb-3">{c.question}</p>
              {c.answer && <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-3 mb-3"><p className="text-sm text-success-700 dark:text-success-300">{c.answer}</p></div>}
              {c.status === 'pending' && (
                answering === c.id ? (
                  <div className="space-y-2">
                    <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} placeholder="اكتب ردك..." />
                    <div className="flex gap-2">
                      <Button onClick={() => handleAnswer(c.id)} className="text-sm"><Send className="w-4 h-4" /> إرسال</Button>
                      <Button variant="ghost" onClick={() => { setAnswering(null); setAnswer(''); }} className="text-sm">إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setAnswering(c.id)} className="text-sm">الرد على الاستشارة</Button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
