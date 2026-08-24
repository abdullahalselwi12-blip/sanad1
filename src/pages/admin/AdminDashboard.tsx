import { useEffect, useState } from 'react';
import { Users, Scale, BookOpen, MessageSquare, FileText, Bot, Newspaper, Bell } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';

interface Stats {
  users: number;
  lawyers: number;
  laws: number;
  articles: number;
  consultations: number;
  documents: number;
  conversations: number;
  news: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, lawyers, laws, articles, consultations, documents, conversations, news] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('lawyers').select('*', { count: 'exact', head: true }),
        supabase.from('laws').select('*', { count: 'exact', head: true }),
        supabase.from('law_articles').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('ai_conversations').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        users: users.count || 0,
        lawyers: lawyers.count || 0,
        laws: laws.count || 0,
        articles: articles.count || 0,
        consultations: consultations.count || 0,
        documents: documents.count || 0,
        conversations: conversations.count || 0,
        news: news.count || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) return <div className="flex justify-center py-20"><Spinner /></div>;

  const cards = [
    { label: 'المستخدمون', value: stats.users, icon: Users, color: 'royal' },
    { label: 'المحامون', value: stats.lawyers, icon: Scale, color: 'gold' },
    { label: 'القوانين', value: stats.laws, icon: BookOpen, color: 'success' },
    { label: 'المواد القانونية', value: stats.articles, icon: FileText, color: 'royal' },
    { label: 'الاستشارات', value: stats.consultations, icon: MessageSquare, color: 'gold' },
    { label: 'الوثائق', value: stats.documents, icon: FileText, color: 'success' },
    { label: 'محادثات الذكاء', value: stats.conversations, icon: Bot, color: 'royal' },
    { label: 'الأخبار', value: stats.news, icon: Newspaper, color: 'gold' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">لوحة المعلومات</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">نظرة عامة على إحصائيات المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-navy-900 dark:text-white">{c.value}</p>
                <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">{c.label}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${c.color}-50 dark:bg-${c.color}-900/20 flex items-center justify-center`}>
                <c.icon className={`w-6 h-6 text-${c.color}-600 dark:text-${c.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
