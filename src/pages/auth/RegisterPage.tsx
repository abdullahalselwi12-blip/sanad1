import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Scale } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { UserRole } from '@/types';
import { cn } from '@/utils';

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin',
  lawyer: '/lawyer/dashboard',
  user: '/dashboard',
};

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    const { error, profile } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) { setError(error === 'User already registered' ? 'هذا البريد الإلكتروني مسجل مسبقاً' : error); return; }
    toast('تم إنشاء حسابك بنجاح', 'success');
    navigate(profile ? ROLE_REDIRECTS[profile.role] : '/dashboard', { replace: true });
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">إنشاء حساب جديد</h2>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">انضم إلى منصة SANAD القانونية</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="الاسم الكامل" type="text" placeholder="محمد أحمد" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User className="w-4 h-4" />} required />
        <Input label="البريد الإلكتروني" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
        <Input label="كلمة المرور" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
        <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
        <div>
          <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">نوع الحساب</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'user' as UserRole, label: 'مستخدم', desc: 'للحصول على استشارات ووثائق' },
              { value: 'lawyer' as UserRole, label: 'محامٍ', desc: 'لإدارة القضايا والعملاء' },
            ].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setRole(opt.value)} className={cn('p-3 rounded-xl border-2 text-right transition-all', role === opt.value ? 'border-royal-500 bg-royal-50 dark:bg-royal-900/20' : 'border-navy-200 dark:border-navy-700 hover:border-navy-300')}>
                <p className="text-sm font-semibold text-navy-900 dark:text-navy-100">{opt.label}</p>
                <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl px-4 py-3 text-sm text-error-700 dark:text-error-300">{error}</div>}
        <Button type="submit" loading={loading} className="w-full">إنشاء الحساب</Button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">لديك حساب بالفعل؟ <Link to="/login" className="text-royal-600 hover:text-royal-700 font-medium">تسجيل الدخول</Link></p>
      <div className="mt-6 p-4 bg-royal-50 dark:bg-royal-900/20 rounded-xl border border-royal-100 dark:border-royal-800">
        <div className="flex items-center gap-2 text-xs text-royal-700 dark:text-royal-300"><Scale className="w-4 h-4" /><span>منصة SANAD تقدم معلومات قانونية للأغراض التثقيفية ولا تغني عن استشارة المحامي المختص.</span></div>
      </div>
    </>
  );
}
