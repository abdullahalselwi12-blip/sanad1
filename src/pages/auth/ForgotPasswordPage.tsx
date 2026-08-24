import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setSent(true);
    toast('تم إرسال رابط استعادة كلمة المرور', 'success');
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">استعادة كلمة المرور</h2>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">{sent ? 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني' : 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة'}</p>
      </div>
      {sent ? (
        <div className="space-y-4">
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4 text-sm text-success-700 dark:text-success-300">تحقق من بريدك الإلكتروني — تم إرسال رابط استعادة كلمة المرور إلى {email}</div>
          <Link to="/login" className="btn-secondary w-full"><ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="البريد الإلكتروني" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
          <Button type="submit" loading={loading} className="w-full">إرسال رابط الاستعادة</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">تذكرت كلمة المرور؟ <Link to="/login" className="text-royal-600 hover:text-royal-700 font-medium">تسجيل الدخول</Link></p>
    </>
  );
}
