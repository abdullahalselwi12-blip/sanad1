import { useEffect, useState } from 'react';
import { Bot, Clock, Star } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { timeAgo } from '@/utils';
import type { AIConversation } from '@/types';

export function DashboardConversations() {
  const { user } = useAuth();
  const [items, setItems] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('ai_conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setItems((data || []) as AIConversation[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">محادثاتي مع المساعد</h1>
      {items.length === 0 ? (
        <EmptyState icon={<Bot className="w-12 h-12" />} title="لا توجد محادثات" description="لم تستخدم المساعد القانوني بعد" />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-royal-100 dark:bg-royal-900/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-royal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900 dark:text-navy-100">{c.question}</p>
                  <p className="text-xs text-navy-400 flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(c.created_at)}</p>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1 text-xs text-gold-500">
                    <Star className="w-3.5 h-3.5 fill-gold-500" /> {c.rating}
                  </div>
                )}
              </div>
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-lg p-3">
                <p className="text-sm text-navy-600 dark:text-navy-300 line-clamp-3 whitespace-pre-line">{c.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
