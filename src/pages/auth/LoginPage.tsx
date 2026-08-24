import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Scale } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { UserRole } from '@/types';

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin',
  lawyer: '/lawyer/dashboard',
  user: '/dashboard',
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error, profile } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : error);
      return;
    }
    toast('مرحباً بك في SANAD', 'success');
    navigate(profile ? ROLE_REDIRECTS[profile.role] : '/dashboard', { replace: true });
  };

  return (
    <>
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-navy-900 dark:text-white">تسجيل الدخول</h2>
      <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">أدخل بياناتك للوصول إلى حسابك</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="كلمة المرور"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-navy-300 text-royal-600 focus:ring-royal-500" />
            <span className="text-navy-600 dark:text-navy-300">تذكرني</span>
          </label>
          <Link to="/forgot-password" className="text-royal-600 hover:text-royal-700 font-medium">نسيت كلمة المرور؟</Link>
        </div>

        {error && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl px-4 py-3 text-sm text-error-700 dark:text-error-300">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          تسجيل الدخول
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="text-royal-600 hover:text-royal-700 font-medium">إنشاء حساب جديد</Link>
      </p>

      <div className="mt-8 p-4 bg-royal-50 dark:bg-royal-900/20 rounded-xl border border-royal-100 dark:border-royal-800">
        <div className="flex items-center gap-2 text-xs text-royal-700 dark:text-royal-300">
          <Scale className="w-4 h-4" />
          <span>منصة SANAD تقدم معلومات قانونية للأغراض التثقيفية ولا تغني عن استشارة المحامي المختص.</span>
        </div>
      </div>
    </>
  );
}
