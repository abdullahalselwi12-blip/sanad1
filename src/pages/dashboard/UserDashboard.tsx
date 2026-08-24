import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Bot, Bell, TrendingUp, Clock } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CONSULTATION_STATUSES } from '@/constants';
import { timeAgo } from '@/utils';
import type { Consultation, Document, AIConversation } from '@/types';

export function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [stats, setStats] = useState({ consultations: 0, documents: 0, conversations: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [cons, docs, convs] = await Promise.all([
        supabase.from('consultations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('ai_conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setConsultations((cons.data || []) as Consultation[]);
      setDocuments((docs.data || []) as Document[]);
      setConversations((convs.data || []) as AIConversation[]);
      setStats({
        consultations: cons.data?.length || 0,
        documents: docs.data?.length || 0,
        conversations: convs.data?.length || 0,
      });
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const cards = [
    { label: 'استشاراتي', value: stats.consultations, icon: MessageSquare, color: 'royal', path: '/dashboard/consultations' },
    { label: 'وثائقي', value: stats.documents, icon: FileText, color: 'gold', path: '/dashboard/documents' },
    { label: 'محادثاتي', value: stats.conversations, icon: Bot, color: 'success', path: '/dashboard/conversations' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">مرحباً، {user?.full_name || user?.email}</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">إليك ملخص نشاطك على المنصة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.path} className="card p-5 hover:shadow-elevated transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-navy-900 dark:text-white">{c.value}</p>
                <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">{c.label}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${c.color}-50 dark:bg-${c.color}-900/20 group-hover:scale-110 transition-transform`}>
                <c.icon className={`w-6 h-6 text-${c.color}-600 dark:text-${c.color}-400`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent consultations */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy-900 dark:text-navy-100 mb-4">أحدث الاستشارات</h2>
          {consultations.length === 0 ? (
            <EmptyState icon={<MessageSquare className="w-10 h-10" />} title="لا توجد استشارات" />
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

        {/* Recent documents */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy-900 dark:text-navy-100 mb-4">أحدث الوثائق</h2>
          {documents.length === 0 ? (
            <EmptyState icon={<FileText className="w-10 h-10" />} title="لا توجد وثائق" />
          ) : (
            <div className="space-y-2">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-50 dark:bg-navy-800/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900 dark:text-navy-100 truncate">{d.title}</p>
                    <p className="text-xs text-navy-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {timeAgo(d.created_at)}</p>
                  </div>
                  <FileText className="w-4 h-4 text-gold-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent AI conversations */}
      <div className="card p-5">
        <h2 className="font-semibold text-navy-900 dark:text-navy-100 mb-4">أحدث محادثات المساعد</h2>
        {conversations.length === 0 ? (
          <EmptyState icon={<Bot className="w-10 h-10" />} title="لا توجد محادثات" />
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-navy-50 dark:bg-navy-800/50">
                <p className="text-sm font-medium text-navy-900 dark:text-navy-100 truncate">{c.question}</p>
                <p className="text-xs text-navy-400 mt-0.5">{timeAgo(c.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
