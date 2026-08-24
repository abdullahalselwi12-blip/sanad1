import { useEffect, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Consultation } from '@/types';

export function DashboardConsultations() {
  const { user } = useAuth();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('consultations').select('*, lawyer:lawyers(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setItems((data || []) as Consultation[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">استشاراتي</h1>
      {items.length === 0 ? (
        <EmptyState icon={<MessageSquare className="w-12 h-12" />} title="لا توجد استشارات" description="لم ترسل أي استشارة بعد" />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-navy-900 dark:text-navy-100">{c.subject}</h3>
                <Badge variant={CONSULTATION_STATUSES[c.status].color}>{CONSULTATION_STATUSES[c.status].label}</Badge>
              </div>
              <p className="text-sm text-navy-600 dark:text-navy-300 mb-2">{c.question}</p>
              {c.answer && <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-3 mb-2"><p className="text-sm text-success-700 dark:text-success-300">{c.answer}</p></div>}
              <p className="text-xs text-navy-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(c.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
