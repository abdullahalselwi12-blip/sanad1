import { useState } from 'react';
import { User, Lock, Sun, Moon, Mail, Phone, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ROLES } from '@/constants';

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName, phone });
    setSaving(false);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حفظ التغييرات', 'success');
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) {
      toast('فشل رفع الصورة', 'error');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateProfile({ avatar_url: publicUrl });
    setUploading(false);
    toast('تم تحديث الصورة', 'success');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('تم تغيير كلمة المرور', 'success');
    setOldPassword(''); setNewPassword('');
  };

  if (!user) {
    return <div className="container-page section-padding py-12"><p className="text-navy-500">يجب تسجيل الدخول</p></div>;
  }

  return (
    <div className="container-page section-padding py-12">
      <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">الإعدادات</h1>
      <p className="text-navy-500 dark:text-navy-400 mb-8">إدارة حسابك وتفضيلاتك</p>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <User className="w-5 h-5 text-royal-600" /> الملف الشخصي
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user.full_name} src={user.avatar_url} size="xl" />
            <div>
              <label className="cursor-pointer">
                <span className="btn-secondary text-sm">
                  <Upload className="w-4 h-4" /> تغيير الصورة
                </span>
                <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" disabled={uploading} />
              </label>
              {uploading && <p className="text-xs text-navy-400 mt-1">جارٍ الرفع...</p>}
            </div>
          </div>
          <div className="space-y-4">
            <Input label="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User className="w-4 h-4" />} />
            <Input label="البريد الإلكتروني" value={user.email} disabled icon={<Mail className="w-4 h-4" />} />
            <Input label="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="w-4 h-4" />} />
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">نوع الحساب</label>
              <div className="px-4 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 text-sm text-navy-600 dark:text-navy-300">{ROLES[user.role]}</div>
            </div>
            <Button onClick={handleSaveProfile} loading={saving}>
              <Save className="w-4 h-4" /> حفظ التغييرات
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <Lock className="w-5 h-5 text-royal-600" /> تغيير كلمة المرور
          </h2>
          <div className="space-y-4">
            <Input label="كلمة المرور الجديدة" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
            <Button onClick={handleChangePassword} loading={changingPassword} variant="secondary">
              تغيير كلمة المرور
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <Sun className="w-5 h-5 text-gold-500" /> المظهر
          </h2>
          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50 dark:bg-navy-800">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-navy-300" /> : <Sun className="w-5 h-5 text-gold-500" />}
              <span className="text-sm font-medium text-navy-700 dark:text-navy-200">{theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}</span>
            </div>
            <button onClick={toggleTheme} className="w-12 h-6 rounded-full bg-navy-200 dark:bg-royal-600 relative transition-colors">
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'right-0.5' : 'right-6'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
