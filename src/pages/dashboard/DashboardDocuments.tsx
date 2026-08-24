import { useEffect, useState } from 'react';
import { FileText, Clock, Download } from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DOCUMENT_TYPES } from '@/constants';
import { timeAgo } from '@/utils';
import { useToast } from '@/contexts/ToastContext';
import type { Document } from '@/types';

export function DashboardDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setItems((data || []) as Document[]);
      setLoading(false);
    })();
  }, [user]);

  const handleDownload = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('تم تحميل الملف', 'success');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">وثائقي</h1>
      {items.length === 0 ? (
        <EmptyState icon={<FileText className="w-12 h-12" />} title="لا توجد وثائق" description="لم تنشئ أي وثيقة بعد" />
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="card p-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 dark:text-navy-100">{d.title}</h3>
                  <Badge variant="navy" className="mt-1">{DOCUMENT_TYPES[d.type]}</Badge>
                  <p className="text-xs text-navy-400 flex items-center gap-1 mt-2"><Clock className="w-3.5 h-3.5" /> {timeAgo(d.created_at)}</p>
                </div>
              </div>
              <button onClick={() => handleDownload(d)} className="btn-ghost text-sm">
                <Download className="w-4 h-4" /> تحميل
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
