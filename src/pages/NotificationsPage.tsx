import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { timeAgo } from '@/utils';
import type { Notification } from '@/types';

const typeIcons = {
  info: { icon: Info, color: 'text-royal-500 bg-royal-50 dark:bg-royal-900/20' },
  success: { icon: CheckCircle, color: 'text-success-500 bg-success-50 dark:bg-success-900/20' },
  warning: { icon: AlertCircle, color: 'text-gold-500 bg-gold-50 dark:bg-gold-900/20' },
  error: { icon: XCircle, color: 'text-error-500 bg-error-50 dark:bg-error-900/20' },
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });
      setNotifications((data || []) as Notification[]);
      setLoading(false);
    })();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="container-page section-padding py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">الإشعارات</h1>
          <p className="text-navy-500 dark:text-navy-400">إشعاراتك وتنبيهاتك</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="secondary" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {!user ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="سجل الدخول"
          description="يجب تسجيل الدخول لعرض إشعاراتك"
          action={<Link to="/login" className="btn-primary">تسجيل الدخول</Link>}
        />
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="w-12 h-12" />} title="لا توجد إشعارات" description="لم تستلم أي إشعارات بعد" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { icon: Icon, color } = typeIcons[n.type];
            return (
              <div key={n.id} className={`card p-4 flex items-start gap-4 ${!n.is_read ? 'border-r-4 border-r-royal-500' : ''}`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-navy-900 dark:text-navy-100 text-sm">{n.title}</h3>
                  <p className="text-sm text-navy-500 dark:text-navy-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-navy-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-royal-500 shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
