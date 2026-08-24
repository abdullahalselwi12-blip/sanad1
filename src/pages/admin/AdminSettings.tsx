import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, Globe, Moon, Search } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import type { SiteSettings } from '@/types';

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      setSettings(data as SiteSettings | null);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({
      site_name: settings.site_name,
      site_logo: settings.site_logo,
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      seo_keywords: settings.seo_keywords,
      dark_mode: settings.dark_mode,
      language: settings.language,
    }).eq('id', settings.id);
    setSaving(false);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حفظ الإعدادات', 'success');
  };

  if (loading || !settings) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إعدادات الموقع</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">إدارة الإعدادات العامة للموقع</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900 dark:text-navy-100"><SettingsIcon className="w-5 h-5 text-royal-600" /> عام</h2>
        <Input label="اسم الموقع" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
        <Input label="رابط الشعار" value={settings.site_logo || ''} onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })} placeholder="https://..." />
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900 dark:text-navy-100"><Search className="w-5 h-5 text-royal-600" /> تحسين محركات البحث (SEO)</h2>
        <Input label="عنوان SEO" value={settings.seo_title || ''} onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} />
        <Textarea label="وصف SEO" value={settings.seo_description || ''} onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })} rows={2} />
        <Input label="كلمات مفتاحية" value={settings.seo_keywords || ''} onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })} placeholder="قانون, يمن, استشارة..." />
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900 dark:text-navy-100"><Globe className="w-5 h-5 text-royal-600" /> اللغة والمظهر</h2>
        <div>
          <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">اللغة</label>
          <select className="input" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value as 'ar' | 'en' })}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.dark_mode} onChange={(e) => setSettings({ ...settings, dark_mode: e.target.checked })} className="w-4 h-4 rounded border-navy-300 text-royal-600 focus:ring-royal-500" />
          <span className="text-sm text-navy-700 dark:text-navy-200 flex items-center gap-1.5"><Moon className="w-4 h-4" /> الوضع الليلي افتراضياً</span>
        </label>
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full"><Save className="w-4 h-4" /> حفظ الإعدادات</Button>
    </div>
  );
}
