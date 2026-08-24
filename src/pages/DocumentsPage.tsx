import { useState } from 'react';
import { FileText, Download, Save, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { DOCUMENT_TYPES } from '@/constants';
import type { DocumentType } from '@/types';

const DOC_FIELDS: Record<DocumentType, { key: string; label: string; type?: string }[]> = {
  marriage_contract: [
    { key: 'groom_name', label: 'اسم الزوج' },
    { key: 'groom_id', label: 'رقم هوية الزوج' },
    { key: 'bride_name', label: 'اسم الزوجة' },
    { key: 'bride_id', label: 'رقم هوية الزوجة' },
    { key: 'dowry', label: 'المهر' },
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'location', label: 'مكان العقد' },
    { key: 'witness1', label: 'الشاهد الأول' },
    { key: 'witness2', label: 'الشاهد الثاني' },
  ],
  sale_contract: [
    { key: 'seller', label: 'اسم البائع' },
    { key: 'buyer', label: 'اسم المشتري' },
    { key: 'item', label: 'المبيع' },
    { key: 'price', label: 'الثمن' },
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'location', label: 'مكان البيع' },
  ],
  rental_contract: [
    { key: 'landlord', label: 'اسم المؤجر' },
    { key: 'tenant', label: 'اسم المستأجر' },
    { key: 'property', label: 'العقار' },
    { key: 'rent', label: 'الإيجار الشهري' },
    { key: 'duration', label: 'مدة الإيجار' },
    { key: 'date', label: 'تاريخ العقد', type: 'date' },
  ],
  employment_contract: [
    { key: 'employer', label: 'اسم صاحب العمل' },
    { key: 'employee', label: 'اسم العامل' },
    { key: 'position', label: 'الوظيفة' },
    { key: 'salary', label: 'الراتب' },
    { key: 'hours', label: 'ساعات العمل' },
    { key: 'date', label: 'تاريخ العقد', type: 'date' },
  ],
  power_of_attorney: [
    { key: 'principal', label: 'اسم الموكل' },
    { key: 'agent', label: 'اسم الوكيل' },
    { key: 'scope', label: 'نطاق الوكالة' },
    { key: 'date', label: 'التاريخ', type: 'date' },
  ],
  declaration: [
    { key: 'declarant', label: 'اسم المقر' },
    { key: 'content', label: 'محتوى الإقرار' },
    { key: 'date', label: 'التاريخ', type: 'date' },
  ],
  warning_notice: [
    { key: 'sender', label: 'اسم المرسل' },
    { key: 'recipient', label: 'اسم المرسل إليه' },
    { key: 'subject', label: 'موضوع الإنذار' },
    { key: 'date', label: 'التاريخ', type: 'date' },
  ],
  agreement: [
    { key: 'party1', label: 'الطرف الأول' },
    { key: 'party2', label: 'الطرف الثاني' },
    { key: 'subject', label: 'موضوع الاتفاقية' },
    { key: 'terms', label: 'الشروط' },
    { key: 'date', label: 'التاريخ', type: 'date' },
  ],
};

const DOC_TEMPLATES: Record<DocumentType, (d: Record<string, string>) => string> = {
  marriage_contract: (d) => `عقد زواج

إن في تاريخ ${d.date || '—'} بمدينة ${d.location || '—'}، تم عقد زواج بين:

الزوج: ${d.groom_name || '—'} — رقم الهوية: ${d.groom_id || '—'}
الزوجة: ${d.bride_name || '—'} — رقم الهوية: ${d.bride_id || '—'}

وقد تم الاتفاق على المهر بمبلغ: ${d.dowry || '—'}

الشاهد الأول: ${d.witness1 || '—'}
الشاهد الثاني: ${d.witness2 || '—'}

تم هذا العقد على وجه الشرع، والله خير الشاهدين.`,
  sale_contract: (d) => `عقد بيع

في تاريخ ${d.date || '—'}، تم الاتفاق بين:

البائع: ${d.seller || '—'}
المشتري: ${d.buyer || '—'}

على بيع: ${d.item || '—'}
بثمن قدره: ${d.price || '—'}

مكان البيع: ${d.location || '—'}

تم هذا العقد برضا الطرفين، وهو نسخة واحدة لا تتجزأ.`,
  rental_contract: (d) => `عقد إيجار

في تاريخ ${d.date || '—'}، تم الاتفاق بين:

المؤجر: ${d.landlord || '—'}
المستأجر: ${d.tenant || '—'}

على إيجار العقار: ${d.property || '—'}
بإيجار شهري قدره: ${d.rent || '—'}
لمدة: ${d.duration || '—'}

يلتزم المستأجر بدفع الإيجار في موعده والمحافظة على العقار.`,
  employment_contract: (d) => `عقد عمل

في تاريخ ${d.date || '—'}، تم الاتفاق بين:

صاحب العمل: ${d.employer || '—'}
العامل: ${d.employee || '—'}

الوظيفة: ${d.position || '—'}
الراتب: ${d.salary || '—'}
ساعات العمل: ${d.hours || '—'}

يلتزم الطرفان بأحكام قانون العمل اليمني.`,
  power_of_attorney: (d) => `وكالة

أنا الموقع أدناه: ${d.principal || '—'}

وكلت: ${d.agent || '—'}

في: ${d.scope || '—'}

التاريخ: ${d.date || '—'}

وهذا التوقيع صحيح ومطابق للأصل.`,
  declaration: (d) => `إقرار

أنا الموقع أدناه: ${d.declarant || '—'}

أقر بما يلي: ${d.content || '—'}

التاريخ: ${d.date || '—'}

وهذا الإقرار صادر عني بكامل إرادتي.`,
  warning_notice: (d) => `إنذار

من: ${d.sender || '—'}
إلى: ${d.recipient || '—'}

الموضوع: ${d.subject || '—'}

التاريخ: ${d.date || '—'}

نلفت انتباهكم إلى ما ذكر أعلاه، ويرجى اتخاذ اللازم خلال المدة القانونية.`,
  agreement: (d) => `اتفاقية

تم الاتفاق في تاريخ ${d.date || '—'} بين:

الطرف الأول: ${d.party1 || '—'}
الطرف الثاني: ${d.party2 || '—'}

موضوع الاتفاقية: ${d.subject || '—'}

الشروط: ${d.terms || '—'}

تم توقيع هذه الاتفاقية برضا الطرفين.`,
};

export function DocumentsPage() {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!selectedType) return;
    const template = DOC_TEMPLATES[selectedType];
    const content = template(formData);
    setGenerated(content);
  };

  const handleDownload = () => {
    const blob = new Blob([generated], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${DOCUMENT_TYPES[selectedType!]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('تم تحميل الملف', 'success');
  };

  const handleSave = async () => {
    if (!user) {
      toast('يجب تسجيل الدخول لحفظ الوثيقة', 'warning');
      return;
    }
    if (!selectedType || !generated) return;
    setSaving(true);
    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      type: selectedType,
      title: DOCUMENT_TYPES[selectedType],
      content: generated,
      data: formData,
    });
    setSaving(false);
    if (error) {
      toast('حدث خطأ أثناء الحفظ', 'error');
      return;
    }
    toast('تم حفظ الوثيقة في حسابك', 'success');
  };

  if (selectedType) {
    return (
      <div className="container-page section-padding py-12">
        <button onClick={() => { setSelectedType(null); setGenerated(''); setFormData({}); }} className="text-sm text-navy-500 hover:text-navy-900 dark:hover:text-white mb-6 transition-colors">
          ← العودة لأنواع الوثائق
        </button>

        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">{DOCUMENT_TYPES[selectedType]}</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mb-8">املأ البيانات التالية لإنشاء الوثيقة</p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {DOC_FIELDS[selectedType].map((field) => (
              <Input
                key={field.key}
                label={field.label}
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              />
            ))}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleGenerate} className="flex-1">
                <FileSignature className="w-4 h-4" /> إنشاء الوثيقة
              </Button>
            </div>
          </div>

          {generated && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900 dark:text-navy-100">الوثيقة المُنشأة</h3>
                <Badge variant="success">جاهزة</Badge>
              </div>
              <pre className="text-sm text-navy-700 dark:text-navy-300 whitespace-pre-wrap font-sans leading-relaxed mb-4 max-h-96 overflow-y-auto">{generated}</pre>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4" /> تحميل
                </Button>
                <Button variant="gold" onClick={handleSave} loading={saving} className="flex-1">
                  <Save className="w-4 h-4" /> حفظ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page section-padding py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">مولد الوثائق القانونية</h1>
        <p className="text-navy-500 dark:text-navy-400">اختر نوع الوثيقة التي تريد إنشاءها</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(DOCUMENT_TYPES) as [DocumentType, string][]).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className="card p-6 text-right hover:shadow-elevated transition-shadow group"
          >
            <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-gold-600 dark:text-gold-400" />
            </div>
            <h3 className="font-semibold text-navy-900 dark:text-navy-100 mb-1">{label}</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">اضغط لإنشاء هذه الوثيقة</p>
          </button>
        ))}
      </div>
    </div>
  );
}
