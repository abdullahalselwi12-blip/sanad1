import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast('كلمتا المرور غير متطابقتين', 'error'); return; }
    if (password.length < 6) { toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('تم تغيير كلمة المرور بنجاح', 'success');
    navigate('/login');
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 mb-4"><CheckCircle className="w-6 h-6 text-success-600" /></div>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">كلمة مرور جديدة</h2>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">أدخل كلمة المرور الجديدة</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="كلمة المرور الجديدة" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
        <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
        <Button type="submit" loading={loading} className="w-full">تغيير كلمة المرور</Button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400"><Link to="/login" className="text-royal-600 hover:text-royal-700 font-medium">العودة لتسجيل الدخول</Link></p>
    </>
  );
}
