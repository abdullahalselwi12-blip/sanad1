import { useEffect, useState, useCallback } from 'react';
import { Bot, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/utils';
import type { AIConversation } from '@/types';

export function AdminAIConversations() {
  const [items, setItems] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('ai_conversations').select('*, profile:profiles(*)').order('created_at', { ascending: false });
    setItems((data || []) as AIConversation[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<AIConversation>[] = [
    { key: 'question', label: 'السؤال', render: (c) => <span className="font-medium text-navy-900 dark:text-navy-100 line-clamp-1">{c.question}</span> },
    { key: 'answer', label: 'الإجابة', render: (c) => <span className="text-xs text-navy-500 line-clamp-1">{c.answer}</span> },
    { key: 'user', label: 'المستخدم', render: (c) => <span className="text-xs">{c.profile?.email}</span> },
    { key: 'rating', label: 'التقييم', render: (c) => c.rating ? <div className="flex items-center gap-1 text-xs text-gold-500"><Star className="w-3.5 h-3.5 fill-gold-500" /> {c.rating}</div> : <span className="text-xs text-navy-400">—</span> },
    { key: 'matched', label: 'مواد مطابقة', render: (c) => <Badge variant="navy">{Array.isArray(c.matched_articles) ? c.matched_articles.length : 0}</Badge> },
    { key: 'created_at', label: 'التاريخ', sortable: true, sortValue: (c) => c.created_at, render: (c) => <span className="text-xs">{timeAgo(c.created_at)}</span> },
  ];

  return <DataTable title="محادثات الذكاء الاصطناعي" data={items} columns={columns} loading={loading} rowKey={(c) => c.id} onSearch={(q) => setItems(items.filter((c) => c.question.includes(q)))} searchPlaceholder="ابحث في المحادثات..." emptyTitle="لا توجد محادثات" />;
}
