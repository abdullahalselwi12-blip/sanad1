import { useEffect, useState } from 'react';
import {
  User,
  Lock,
  Sun,
  Moon,
  Mail,
  Phone,
  Save,
  Upload,
  Scale,
  BriefcaseBusiness,
  MapPin,
  FileText,
  BadgeCheck,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ROLES } from '@/constants';

interface LawyerProfile {
  id: string;
  profile_id: string;
  license_number: string | null;
  specialization: string | null;
  bio: string | null;
  experience_years: number | null;
  office_address: string | null;
  is_verified: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // =========================
  // User Settings
  // =========================
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  // =========================
  // Password
  // =========================
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // =========================
  // Avatar
  // =========================
  const [uploading, setUploading] = useState(false);

  // =========================
  // Lawyer Profile
  // =========================
  const [lawyerProfile, setLawyerProfile] =
    useState<LawyerProfile | null>(null);

  const [loadingLawyer, setLoadingLawyer] = useState(false);
  const [savingLawyer, setSavingLawyer] = useState(false);

  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  // =========================================================
  // Load verified lawyer profile
  // =========================================================
  useEffect(() => {
    const loadLawyerProfile = async () => {
      if (!user?.id) {
        setLawyerProfile(null);
        return;
      }

      setLoadingLawyer(true);

      try {
        const { data, error } = await supabase
          .from('lawyers')
          .select(
            `
              id,
              profile_id,
              license_number,
              specialization,
              bio,
              experience_years,
              office_address,
              is_verified,
              rating,
              created_at,
              updated_at
            `
          )
          .eq('profile_id', user.id)
          .eq('is_verified', true)
          .maybeSingle();

        if (error) {
          console.error('Failed to load lawyer profile:', error);
          setLawyerProfile(null);
          return;
        }

        if (!data) {
          // User is not a verified lawyer
          setLawyerProfile(null);
          return;
        }

        const lawyer = data as LawyerProfile;

        setLawyerProfile(lawyer);

        setLicenseNumber(lawyer.license_number || '');
        setSpecialization(lawyer.specialization || '');
        setBio(lawyer.bio || '');
        setExperienceYears(
          lawyer.experience_years !== null
            ? String(lawyer.experience_years)
            : ''
        );
        setOfficeAddress(lawyer.office_address || '');
      } catch (error) {
        console.error('Unexpected lawyer profile error:', error);
        setLawyerProfile(null);
      } finally {
        setLoadingLawyer(false);
      }
    };

    loadLawyerProfile();
  }, [user?.id]);

  // =========================================================
  // Save normal user profile
  // =========================================================
  const handleSaveProfile = async () => {
    setSaving(true);

    const { error } = await updateProfile({
      full_name: fullName,
      phone,
    });

    setSaving(false);

    if (error) {
      toast('حدث خطأ أثناء حفظ البيانات', 'error');
      return;
    }

    toast('تم حفظ التغييرات', 'success');
  };

  // =========================================================
  // Upload avatar
  // =========================================================
  const handleUploadAvatar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !user) return;

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
        });

      if (uploadError) {
        toast('فشل رفع الصورة', 'error');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);

      await updateProfile({
        avatar_url: publicUrl,
      });

      toast('تم تحديث الصورة', 'success');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast('حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // Change password
  // =========================================================
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast(
        'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        'error'
      );
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setChangingPassword(false);

    if (error) {
      toast(error.message, 'error');
      return;
    }

    toast('تم تغيير كلمة المرور', 'success');
    setNewPassword('');
  };

  // =========================================================
  // Save verified lawyer profile
  // =========================================================
  const handleSaveLawyerProfile = async () => {
    if (!lawyerProfile || !user) return;

    const parsedExperience =
      experienceYears.trim() === ''
        ? null
        : Number(experienceYears);

    if (
      parsedExperience !== null &&
      (!Number.isInteger(parsedExperience) ||
        parsedExperience < 0)
    ) {
      toast('سنوات الخبرة يجب أن تكون رقمًا صحيحًا موجبًا', 'error');
      return;
    }

    setSavingLawyer(true);

    try {
      const { data, error } = await supabase
        .from('lawyers')
        .update({
          license_number:
            licenseNumber.trim() || null,
          specialization:
            specialization.trim() || null,
          bio: bio.trim() || null,
          experience_years: parsedExperience,
          office_address:
            officeAddress.trim() || null,
        })
        .eq('id', lawyerProfile.id)
        .eq('profile_id', user.id)
        .eq('is_verified', true)
        .select(
          `
            id,
            profile_id,
            license_number,
            specialization,
            bio,
            experience_years,
            office_address,
            is_verified,
            rating,
            created_at,
            updated_at
          `
        )
        .single();

      if (error) {
        console.error('Lawyer profile update error:', error);
        toast('فشل حفظ بيانات المحامي', 'error');
        return;
      }

      setLawyerProfile(data as LawyerProfile);

      toast('تم حفظ الملف المهني بنجاح', 'success');
    } catch (error) {
      console.error('Unexpected lawyer update error:', error);
      toast('حدث خطأ أثناء حفظ الملف المهني', 'error');
    } finally {
      setSavingLawyer(false);
    }
  };

  // =========================================================
  // Not logged in
  // =========================================================
  if (!user) {
    return (
      <div className="container-page section-padding py-12">
        <p className="text-navy-500">
          يجب تسجيل الدخول
        </p>
      </div>
    );
  }

  return (
    <div className="container-page section-padding py-12">

      {/* =====================================================
          Page Header
      ====================================================== */}
      <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
        الإعدادات
      </h1>

      <p className="text-navy-500 dark:text-navy-400 mb-8">
        إدارة حسابك وتفضيلاتك
      </p>

      <div className="space-y-6 max-w-2xl">

        {/* =====================================================
            Normal Profile
        ====================================================== */}
        <div className="card p-6">

          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <User className="w-5 h-5 text-royal-600" />
            الملف الشخصي
          </h2>

          <div className="flex items-center gap-4 mb-6">

            <Avatar
              name={user.full_name}
              src={user.avatar_url}
              size="xl"
            />

            <div>
              <label className="cursor-pointer">
                <span className="btn-secondary text-sm">
                  <Upload className="w-4 h-4" />
                  تغيير الصورة
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <p className="text-xs text-navy-400 mt-1">
                  جارٍ الرفع...
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">

            <Input
              label="الاسم الكامل"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              icon={
                <User className="w-4 h-4" />
              }
            />

            <Input
              label="البريد الإلكتروني"
              value={user.email}
              disabled
              icon={
                <Mail className="w-4 h-4" />
              }
            />

            <Input
              label="رقم الهاتف"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              icon={
                <Phone className="w-4 h-4" />
              }
            />

            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
                نوع الحساب
              </label>

              <div className="px-4 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-800 text-sm text-navy-600 dark:text-navy-300">
                {ROLES[user.role]}
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              loading={saving}
            >
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </Button>

          </div>
        </div>

        {/* =====================================================
            VERIFIED LAWYER SETTINGS
            تظهر فقط إذا is_verified = true
        ====================================================== */}
        {lawyerProfile && (
          <div className="card p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100">
                <Scale className="w-5 h-5 text-royal-600" />
                الملف المهني للمحامي
              </h2>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">
                <BadgeCheck className="w-4 h-4" />
                محامي معتمد
              </div>

            </div>

            {loadingLawyer ? (
              <p className="text-sm text-navy-500">
                جارٍ تحميل بيانات المحامي...
              </p>
            ) : (
              <div className="space-y-4">

                {/* License */}
                <Input
                  label="رقم الترخيص"
                  value={licenseNumber}
                  onChange={(e) =>
                    setLicenseNumber(e.target.value)
                  }
                  icon={
                    <FileText className="w-4 h-4" />
                  }
                />

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
                    التخصص القانوني
                  </label>

                  <select
                    value={specialization}
                    onChange={(e) =>
                      setSpecialization(e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-500"
                  >
                    <option value="">
                      اختر التخصص
                    </option>

                    <option value="القانون المدني">
                      القانون المدني
                    </option>

                    <option value="القانون الجنائي">
                      القانون الجنائي
                    </option>

                    <option value="القانون التجاري">
                      القانون التجاري
                    </option>

                    <option value="قانون الأسرة">
                      قانون الأسرة
                    </option>

                    <option value="القانون الإداري">
                      القانون الإداري
                    </option>

                    <option value="القانون الدولي">
                      القانون الدولي
                    </option>

                    <option value="أخرى">
                      أخرى
                    </option>
                  </select>
                </div>

                {/* Experience */}
                <Input
                  label="سنوات الخبرة"
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) =>
                    setExperienceYears(e.target.value)
                  }
                  icon={
                    <BriefcaseBusiness className="w-4 h-4" />
                  }
                />

                {/* Office */}
                <Input
                  label="عنوان المكتب"
                  value={officeAddress}
                  onChange={(e) =>
                    setOfficeAddress(e.target.value)
                  }
                  icon={
                    <MapPin className="w-4 h-4" />
                  }
                />

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
                    نبذة مهنية / السيرة الذاتية
                  </label>

                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value)
                    }
                    rows={5}
                    placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك ومجالات عملك..."
                    className="w-full px-4 py-3 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-800 dark:text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-royal-500 resize-none"
                  />
                </div>

                {/* Rating - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
                    التقييم
                  </label>

                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-50 dark:bg-navy-800 text-sm text-navy-600 dark:text-navy-300">
                    <Star className="w-4 h-4 text-gold-500 fill-current" />

                    {lawyerProfile.rating !== null
                      ? lawyerProfile.rating
                      : 0}

                    <span className="text-navy-400">
                      / 5
                    </span>

                    <span className="mr-1 text-xs text-navy-400">
                      يتم تحديث التقييم من النظام
                    </span>
                  </div>
                </div>

                {/* Verification - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
                    حالة التحقق
                  </label>

                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                    <BadgeCheck className="w-5 h-5" />
                    تم اعتماد المحامي
                  </div>
                </div>

                {/* Save */}
                <Button
                  onClick={handleSaveLawyerProfile}
                  loading={savingLawyer}
                >
                  <Save className="w-4 h-4" />
                  حفظ الملف المهني
                </Button>

              </div>
            )}
          </div>
        )}

        {/* =====================================================
            Password
        ====================================================== */}
        <div className="card p-6">

          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <Lock className="w-5 h-5 text-royal-600" />
            تغيير كلمة المرور
          </h2>

          <div className="space-y-4">

            <Input
              label="كلمة المرور الجديدة"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              icon={
                <Lock className="w-4 h-4" />
              }
            />

            <Button
              onClick={handleChangePassword}
              loading={changingPassword}
              variant="secondary"
            >
              تغيير كلمة المرور
            </Button>

          </div>
        </div>

        {/* =====================================================
            Appearance
        ====================================================== */}
        <div className="card p-6">

          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-navy-100 mb-4">
            <Sun className="w-5 h-5 text-gold-500" />
            المظهر
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50 dark:bg-navy-800">

            <div className="flex items-center gap-3">

              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-navy-300" />
              ) : (
                <Sun className="w-5 h-5 text-gold-500" />
              )}

              <span className="text-sm font-medium text-navy-700 dark:text-navy-200">
                {theme === 'dark'
                  ? 'الوضع الليلي'
                  : 'الوضع النهاري'}
              </span>

            </div>

            <button
              onClick={toggleTheme}
              className="w-12 h-6 rounded-full bg-navy-200 dark:bg-royal-600 relative transition-colors"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  theme === 'dark'
                    ? 'right-0.5'
                    : 'right-6'
                }`}
              />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}