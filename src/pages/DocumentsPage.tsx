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

/*
========================================================
 SANAD - Legal Document Generator
 نظام موحد لإنشاء الوثائق القانونية بصيغة A4
========================================================

 ملاحظات:
 - لا يحتاج مكتبة خارجية.
 - لا يغير Supabase.
 - لا يغير جدول documents.
 - لا يغير نظام تسجيل الدخول.
 - يحافظ على الحفظ الحالي.
 - الطباعة تتم من المتصفح مباشرة.
*/

type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
};

type TemplateKey =
  | 'marriage'
  | 'rental'
  | 'sale'
  | 'power'
  | 'declaration'
  | 'company'
  | 'other';

/*
========================================================
 أنواع الوثائق الظاهرة للمستخدم
========================================================
*/

const TEMPLATE_TYPES: {
  key: TemplateKey;
  title: string;
  description: string;
  dbType: DocumentType;
}[] = [
  {
    key: 'marriage',
    title: 'عقد زواج',
    description: 'إنشاء عقد زواج منظم ببيانات الأطراف والمهر والشهود.',
    dbType: 'marriage_contract',
  },
  {
    key: 'rental',
    title: 'عقد إيجار',
    description: 'إنشاء عقد إيجار للعقار أو المنزل أو المحل.',
    dbType: 'rental_contract',
  },
  {
    key: 'sale',
    title: 'عقد بيع',
    description: 'إنشاء عقد بيع منظم للمنقولات أو العقارات.',
    dbType: 'sale_contract',
  },
  {
    key: 'power',
    title: 'وكالة',
    description: 'إنشاء وكالة وتحديد صلاحيات الوكيل.',
    dbType: 'power_of_attorney',
  },
  {
    key: 'declaration',
    title: 'إقرار وتعهد',
    description: 'إنشاء إقرار أو تعهد مكتوب.',
    dbType: 'declaration',
  },
  {
    key: 'company',
    title: 'عقود الشركات',
    description: 'إنشاء اتفاقية أو عقد منظم بين أطراف الشركة.',
    dbType: 'agreement',
  },
  {
    key: 'other',
    title: 'وثائق أخرى',
    description: 'إنشاء وثيقة عامة قابلة للتخصيص والطباعة.',
    dbType: 'warning_notice',
  },
];

/*
========================================================
 الحقول
========================================================
*/

const DOC_FIELDS: Record<TemplateKey, Field[]> = {
  marriage: [
    {
      key: 'groom_name',
      label: 'اسم الزوج',
      placeholder: 'الاسم الكامل للزوج',
    },
    {
      key: 'groom_id',
      label: 'رقم هوية الزوج',
      placeholder: 'رقم البطاقة الشخصية',
    },
    {
      key: 'groom_father',
      label: 'اسم والد الزوج',
      placeholder: 'اسم الأب',
    },
    {
      key: 'bride_name',
      label: 'اسم الزوجة',
      placeholder: 'الاسم الكامل للزوجة',
    },
    {
      key: 'bride_id',
      label: 'رقم هوية الزوجة',
      placeholder: 'رقم البطاقة الشخصية',
    },
    {
      key: 'bride_father',
      label: 'اسم والد الزوجة',
      placeholder: 'اسم الأب',
    },
    {
      key: 'guardian',
      label: 'اسم الولي',
      placeholder: 'اسم ولي الزوجة',
    },
    {
      key: 'dowry',
      label: 'المهر',
      placeholder: 'قيمة المهر',
    },
    {
      key: 'date',
      label: 'تاريخ العقد',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان العقد',
      placeholder: 'المدينة / المنطقة',
    },
    {
      key: 'witness1',
      label: 'الشاهد الأول',
      placeholder: 'اسم الشاهد الأول',
    },
    {
      key: 'witness2',
      label: 'الشاهد الثاني',
      placeholder: 'اسم الشاهد الثاني',
    },
    {
      key: 'conditions',
      label: 'الشروط الخاصة',
      multiline: true,
      placeholder: 'اكتب أي شروط إضافية متفق عليها',
    },
  ],

  rental: [
    {
      key: 'landlord',
      label: 'اسم المؤجر',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'landlord_id',
      label: 'هوية المؤجر',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'tenant',
      label: 'اسم المستأجر',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'tenant_id',
      label: 'هوية المستأجر',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'property',
      label: 'وصف العقار',
      multiline: true,
      placeholder: 'نوع العقار وموقعه ووصفه',
    },
    {
      key: 'rent',
      label: 'قيمة الإيجار',
      placeholder: 'المبلغ',
    },
    {
      key: 'duration',
      label: 'مدة الإيجار',
      placeholder: 'مثال: سنة كاملة',
    },
    {
      key: 'start_date',
      label: 'بداية العقد',
      type: 'date',
    },
    {
      key: 'end_date',
      label: 'نهاية العقد',
      type: 'date',
    },
    {
      key: 'payment_method',
      label: 'طريقة دفع الإيجار',
      placeholder: 'شهري / سنوي / أخرى',
    },
    {
      key: 'conditions',
      label: 'الشروط',
      multiline: true,
      placeholder: 'الشروط والالتزامات',
    },
    {
      key: 'location',
      label: 'مكان تحرير العقد',
      placeholder: 'المدينة / المنطقة',
    },
  ],

  sale: [
    {
      key: 'seller',
      label: 'اسم البائع',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'seller_id',
      label: 'هوية البائع',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'buyer',
      label: 'اسم المشتري',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'buyer_id',
      label: 'هوية المشتري',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'item',
      label: 'المبيع',
      multiline: true,
      placeholder: 'وصف الشيء أو العقار المباع',
    },
    {
      key: 'price',
      label: 'الثمن',
      placeholder: 'قيمة البيع',
    },
    {
      key: 'payment',
      label: 'طريقة الدفع',
      placeholder: 'نقدًا / تحويل / أقساط',
    },
    {
      key: 'date',
      label: 'تاريخ البيع',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان البيع',
      placeholder: 'المدينة / المنطقة',
    },
    {
      key: 'conditions',
      label: 'الشروط الخاصة',
      multiline: true,
      placeholder: 'أي شروط إضافية',
    },
  ],

  power: [
    {
      key: 'principal',
      label: 'اسم الموكل',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'principal_id',
      label: 'هوية الموكل',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'agent',
      label: 'اسم الوكيل',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'agent_id',
      label: 'هوية الوكيل',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'scope',
      label: 'نطاق الوكالة',
      multiline: true,
      placeholder: 'اكتب الصلاحيات الممنوحة للوكيل بالتفصيل',
    },
    {
      key: 'duration',
      label: 'مدة الوكالة',
      placeholder: 'مثال: حتى تاريخ...',
    },
    {
      key: 'date',
      label: 'تاريخ الوكالة',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان تحرير الوكالة',
      placeholder: 'المدينة / المنطقة',
    },
  ],

  declaration: [
    {
      key: 'declarant',
      label: 'اسم المقر',
      placeholder: 'الاسم الكامل',
    },
    {
      key: 'id',
      label: 'رقم الهوية',
      placeholder: 'رقم البطاقة الشخصية',
    },
    {
      key: 'address',
      label: 'العنوان',
      placeholder: 'العنوان',
    },
    {
      key: 'subject',
      label: 'موضوع الإقرار',
      placeholder: 'موضوع الإقرار',
    },
    {
      key: 'content',
      label: 'نص الإقرار والتعهد',
      multiline: true,
      placeholder: 'اكتب نص الإقرار والتعهد بالتفصيل',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان الإقرار',
      placeholder: 'المدينة / المنطقة',
    },
  ],

  company: [
    {
      key: 'company_name',
      label: 'اسم الشركة',
      placeholder: 'اسم الشركة',
    },
    {
      key: 'company_type',
      label: 'نوع الشركة',
      placeholder: 'نوع الشركة',
    },
    {
      key: 'party1',
      label: 'الطرف الأول',
      placeholder: 'اسم الطرف الأول',
    },
    {
      key: 'party1_id',
      label: 'هوية الطرف الأول',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'party2',
      label: 'الطرف الثاني',
      placeholder: 'اسم الطرف الثاني',
    },
    {
      key: 'party2_id',
      label: 'هوية الطرف الثاني',
      placeholder: 'رقم الهوية',
    },
    {
      key: 'subject',
      label: 'موضوع العقد',
      multiline: true,
      placeholder: 'موضوع العقد أو الاتفاقية',
    },
    {
      key: 'capital',
      label: 'رأس المال',
      placeholder: 'قيمة رأس المال',
    },
    {
      key: 'shares',
      label: 'نسبة الشراكة',
      placeholder: 'مثال: 50% / 50%',
    },
    {
      key: 'responsibilities',
      label: 'المسؤوليات',
      multiline: true,
      placeholder: 'مسؤوليات كل طرف',
    },
    {
      key: 'terms',
      label: 'الشروط',
      multiline: true,
      placeholder: 'الشروط والأحكام',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان العقد',
      placeholder: 'المدينة / المنطقة',
    },
  ],

  other: [
    {
      key: 'document_title',
      label: 'عنوان الوثيقة',
      placeholder: 'مثال: إنذار قانوني',
    },
    {
      key: 'sender',
      label: 'المرسل / الطرف الأول',
      placeholder: 'الاسم',
    },
    {
      key: 'recipient',
      label: 'المستلم / الطرف الثاني',
      placeholder: 'الاسم',
    },
    {
      key: 'subject',
      label: 'الموضوع',
      placeholder: 'موضوع الوثيقة',
    },
    {
      key: 'content',
      label: 'محتوى الوثيقة',
      multiline: true,
      placeholder: 'اكتب محتوى الوثيقة بالتفصيل',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'المكان',
      placeholder: 'المدينة / المنطقة',
    },
  ],
};

/*
========================================================
 أدوات
========================================================
*/

const value = (
  data: Record<string, string>,
  key: string
) => data[key]?.trim() || '................................';

const formatDate = (date?: string) => {
  if (!date) return '................';

  try {
    return new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

/*
========================================================
 توليد النص
========================================================
*/

const generateText = (
  type: TemplateKey,
  d: Record<string, string>
): string => {
  switch (type) {
    case 'marriage':
      return `
بسم الله الرحمن الرحيم

عقد زواج

إنه في يوم ${formatDate(d.date)} الموافق ../../....م
تم بحمد الله وتوفيقه إبرام عقد الزواج بين كل من:

أولاً: الزوج
الاسم: ${value(d, 'groom_name')}
رقم الهوية: ${value(d, 'groom_id')}
اسم الأب: ${value(d, 'groom_father')}

ثانياً: الزوجة
الاسم: ${value(d, 'bride_name')}
رقم الهوية: ${value(d, 'bride_id')}
اسم الأب: ${value(d, 'bride_father')}

ولي الزوجة: ${value(d, 'guardian')}

المهر:
${value(d, 'dowry')}

وقد تم العقد بحضور الشاهدين:

الشاهد الأول: ${value(d, 'witness1')}
الشاهد الثاني: ${value(d, 'witness2')}

البند الأول:
أقر الطرفان برضاهما وإرادتهما الحرة في إبرام هذا العقد.

البند الثاني:
يلتزم الطرفان بما يترتب على عقد الزواج من حقوق والتزامات وفق الأحكام الشرعية والقانونية المعمول بها.

البند الثالث:
الشروط الخاصة:
${value(d, 'conditions')}

مكان العقد:
${value(d, 'location')}

التاريخ:
${formatDate(d.date)}

توقيع الزوج: ______________________

توقيع الزوجة: _____________________

توقيع الولي: ______________________

توقيع الشاهد الأول: _______________

توقيع الشاهد الثاني: ______________
`;

    case 'rental':
      return `
بسم الله الرحمن الرحيم

عقد إيجار

إنه في يوم ${formatDate(d.date)} تم الاتفاق بين:

الطرف الأول - المؤجر:
الاسم: ${value(d, 'landlord')}
رقم الهوية: ${value(d, 'landlord_id')}

الطرف الثاني - المستأجر:
الاسم: ${value(d, 'tenant')}
رقم الهوية: ${value(d, 'tenant_id')}

أولاً: العين المؤجرة
${value(d, 'property')}

ثانياً: مدة الإيجار
تبدأ من: ${formatDate(d.start_date)}
وتنتهي في: ${formatDate(d.end_date)}
مدة العقد: ${value(d, 'duration')}

ثالثاً: قيمة الإيجار
${value(d, 'rent')}

رابعاً: طريقة الدفع
${value(d, 'payment_method')}

خامساً: الشروط والالتزامات
${value(d, 'conditions')}

سادساً:
يلتزم كل طرف بتنفيذ ما تم الاتفاق عليه في هذا العقد.

مكان تحرير العقد:
${value(d, 'location')}

توقيع المؤجر:
____________________________

توقيع المستأجر:
____________________________
`;

    case 'sale':
      return `
بسم الله الرحمن الرحيم

عقد بيع

إنه في يوم ${formatDate(d.date)} تم الاتفاق والتراضي بين:

الطرف الأول - البائع:
الاسم: ${value(d, 'seller')}
رقم الهوية: ${value(d, 'seller_id')}

الطرف الثاني - المشتري:
الاسم: ${value(d, 'buyer')}
رقم الهوية: ${value(d, 'buyer_id')}

أولاً: المبيع
${value(d, 'item')}

ثانياً: الثمن
${value(d, 'price')}

ثالثاً: طريقة الدفع
${value(d, 'payment')}

رابعاً: الشروط الخاصة
${value(d, 'conditions')}

خامساً:
يقر الطرفان بصحة البيانات الواردة في هذا العقد وبإتمام الاتفاق بينهما.

مكان البيع:
${value(d, 'location')}

توقيع البائع:
____________________________

توقيع المشتري:
____________________________

الشاهد الأول:
____________________________

الشاهد الثاني:
____________________________
`;

    case 'power':
      return `
بسم الله الرحمن الرحيم

وكالة

أنا الموقع أدناه:

اسم الموكل:
${value(d, 'principal')}

رقم الهوية:
${value(d, 'principal_id')}

قد وكلت:

اسم الوكيل:
${value(d, 'agent')}

رقم الهوية:
${value(d, 'agent_id')}

وذلك للقيام بالأعمال والصلاحيات التالية:

${value(d, 'scope')}

مدة الوكالة:
${value(d, 'duration')}

تاريخ الوكالة:
${formatDate(d.date)}

مكان تحرير الوكالة:
${value(d, 'location')}

توقيع الموكل:
____________________________

توقيع الوكيل:
____________________________

الشاهد الأول:
____________________________

الشاهد الثاني:
____________________________
`;

    case 'declaration':
      return `
بسم الله الرحمن الرحيم

إقرار وتعهد

أنا الموقع أدناه:

الاسم:
${value(d, 'declarant')}

رقم الهوية:
${value(d, 'id')}

العنوان:
${value(d, 'address')}

موضوع الإقرار:
${value(d, 'subject')}

أقر وأتعهد بما يلي:

${value(d, 'content')}

وأقر بأن هذا الإقرار صدر مني بإرادتي واختياري، وبعد اطلاعي على محتواه.

التاريخ:
${formatDate(d.date)}

مكان الإقرار:
${value(d, 'location')}

اسم المقر:
${value(d, 'declarant')}

التوقيع:
____________________________
`;

    case 'company':
      return `
بسم الله الرحمن الرحيم

عقد / اتفاقية شركة

اسم الشركة:
${value(d, 'company_name')}

نوع الشركة:
${value(d, 'company_type')}

تم الاتفاق بين:

الطرف الأول:
${value(d, 'party1')}
رقم الهوية:
${value(d, 'party1_id')}

الطرف الثاني:
${value(d, 'party2')}
رقم الهوية:
${value(d, 'party2_id')}

موضوع العقد:
${value(d, 'subject')}

رأس المال:
${value(d, 'capital')}

نسبة الشراكة:
${value(d, 'shares')}

مسؤوليات الأطراف:
${value(d, 'responsibilities')}

الشروط والأحكام:
${value(d, 'terms')}

يقر الطرفان بموافقتهما على البنود المذكورة أعلاه.

التاريخ:
${formatDate(d.date)}

مكان العقد:
${value(d, 'location')}

توقيع الطرف الأول:
____________________________

توقيع الطرف الثاني:
____________________________

الشاهد الأول:
____________________________

الشاهد الثاني:
____________________________
`;

    case 'other':
      return `
بسم الله الرحمن الرحيم

${value(d, 'document_title')}

من:
${value(d, 'sender')}

إلى:
${value(d, 'recipient')}

الموضوع:
${value(d, 'subject')}

نص الوثيقة:

${value(d, 'content')}

التاريخ:
${formatDate(d.date)}

المكان:
${value(d, 'location')}

التوقيع:
____________________________
`;

    default:
      return '';
  }
};

/*
========================================================
 الصفحة
========================================================
*/

export function DocumentsPage() {
  const [selectedType, setSelectedType] =
    useState<TemplateKey | null>(null);

  const [formData, setFormData] =
    useState<Record<string, string>>({});

  const [generated, setGenerated] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const selectedTemplate =
    TEMPLATE_TYPES.find(
      (item) => item.key === selectedType
    );

  /*
  ======================================================
  إنشاء الوثيقة
  ======================================================
  */

  const handleGenerate = () => {
    if (!selectedType) return;

    const requiredFields =
      DOC_FIELDS[selectedType];

    const missing = requiredFields
      .filter(
        (field) =>
          !formData[field.key]?.trim() &&
          field.key !== 'conditions'
      )
      .slice(0, 2);

    if (missing.length > 0) {
      toast(
        `يرجى تعبئة: ${missing
          .map((item) => item.label)
          .join(' و ')}`,
        'warning'
      );

      return;
    }

    const content =
      generateText(
        selectedType,
        formData
      );

    setGenerated(content);

    setTimeout(() => {
      document
        .getElementById('document-preview')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  /*
  ======================================================
  الطباعة
  ======================================================
  */

  const handlePrint = () => {
    if (!generated) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );
      return;
    }

    window.print();
  };

  /*
  ======================================================
  التحميل
  ======================================================
  */

  const handleDownload = () => {
    if (!generated) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );
      return;
    }

    const blob = new Blob(
      [generated],
      {
        type:
          'text/plain;charset=utf-8',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      `${selectedTemplate?.title || 'وثيقة'}-SANAD.txt`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    toast(
      'تم تحميل الوثيقة',
      'success'
    );
  };

  /*
  ======================================================
  حفظ في Supabase
  ======================================================
  */

  const handleSave = async () => {
    if (!user) {
      toast(
        'يجب تسجيل الدخول لحفظ الوثيقة',
        'warning'
      );
      return;
    }

    if (
      !selectedTemplate ||
      !generated
    ) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );
      return;
    }

    setSaving(true);

    try {
      const { error } =
        await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            type:
              selectedTemplate.dbType,
            title:
              selectedTemplate.title,
            content: generated,
            data: formData,
          });

      if (error) {
        console.error(
          'Save document error:',
          error
        );

        toast(
          'حدث خطأ أثناء حفظ الوثيقة',
          'error'
        );

        return;
      }

      toast(
        'تم حفظ الوثيقة في حسابك',
        'success'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ======================================================
  العودة
  ======================================================
  */

  const handleBack = () => {
    setSelectedType(null);
    setFormData({});
    setGenerated('');
  };

  /*
  ======================================================
  اختيار نوع الوثيقة
  ======================================================
  */

  if (!selectedType) {
    return (
      <div
        dir="rtl"
        className="container-page section-padding py-12"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 dark:bg-gold-900/20">
              <FileText className="w-6 h-6 text-gold-600 dark:text-gold-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
                مولد الوثائق القانونية
              </h1>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                أنشئ وثائق قانونية منظمة وقابلة للطباعة
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATE_TYPES.map(
            (template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => {
                  setSelectedType(
                    template.key
                  );

                  setFormData({});

                  setGenerated('');
                }}
                className="card p-6 text-right hover:shadow-elevated hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileSignature className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                </div>

                <h3 className="font-semibold text-navy-900 dark:text-navy-100 mb-2">
                  {template.title}
                </h3>

                <p className="text-sm leading-6 text-navy-500 dark:text-navy-400">
                  {template.description}
                </p>

                <div className="mt-4 text-xs font-medium text-royal-600 dark:text-royal-400">
                  إنشاء الوثيقة ←
                </div>
              </button>
            )
          )}
        </div>

        <div className="mt-8 card p-5">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />

            <p className="text-xs leading-6 text-navy-500 dark:text-navy-400">
              النماذج التي تنشئها منصة SANAD
              مخصصة لإعداد الوثائق القانونية
              والطباعة. ولا تصبح وثائق حكومية
              رسمية إلا بعد استكمال إجراءات
              الاعتماد والتوثيق لدى الجهة
              المختصة.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  ======================================================
  محرر الوثيقة
  ======================================================
  */

  return (
    <>
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            #document-print-area,
            #document-print-area * {
              visibility: visible;
            }

            #document-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 14mm;
              background: white !important;
              color: #111 !important;
              box-shadow: none !important;
            }

            .document-no-print {
              display: none !important;
            }

            .document-paper {
              box-shadow: none !important;
              border: 2px solid #111 !important;
            }
          }

          .document-paper {
            width: 210mm;
            min-height: 297mm;
            margin: auto;
            background: #fff;
            color: #111;
            box-sizing: border-box;
            padding: 13mm;
            border: 2px solid #172033;
            box-shadow:
              0 12px 35px rgba(0,0,0,.12);
            font-family:
              "Tajawal",
              "Arial",
              sans-serif;
          }

          .document-border {
            min-height: 268mm;
            border: 1px solid #777;
            padding: 10mm;
            box-sizing: border-box;
          }

          .document-title {
            text-align: center;
            font-size: 22px;
            font-weight: 800;
            margin: 7px 0 3px;
            text-decoration: underline;
          }

          .document-bismillah {
            text-align: center;
            font-size: 16px;
            font-weight: 700;
          }

          .document-meta {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 18px 0;
            font-size: 12px;
          }

          .document-section-title {
            text-align: center;
            font-weight: 800;
            font-size: 14px;
            text-decoration: underline;
            margin: 17px 0 8px;
          }

          .document-text {
            font-size: 12px;
            line-height: 2;
            text-align: justify;
            white-space: pre-line;
          }

          .document-line {
            border-bottom: 1px dotted #555;
            min-height: 25px;
          }

          .document-signatures {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
            gap: 25px;
            margin-top: 35px;
            text-align: center;
            font-size: 12px;
          }

          .document-signature {
            min-height: 55px;
          }

          .document-footer {
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px solid #888;
            text-align: center;
            font-size: 9px;
            color: #555;
          }
        `}
      </style>

      <div
        dir="rtl"
        className="container-page section-padding py-10"
      >
        <div className="document-no-print">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-navy-500 hover:text-navy-900 dark:hover:text-white mb-6 transition-colors"
          >
            ← العودة إلى أنواع الوثائق
          </button>

          <div className="mb-7">
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
              {selectedTemplate?.title}
            </h1>

            <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
              أدخل البيانات ثم أنشئ الوثيقة
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-5">
                بيانات الوثيقة
              </h2>

              <div className="space-y-4">
                {DOC_FIELDS[
                  selectedType
                ].map((field) => {
                  if (field.multiline) {
                    return (
                      <Textarea
                        key={field.key}
                        label={field.label}
                        value={
                          formData[
                            field.key
                          ] || ''
                        }
                        placeholder={
                          field.placeholder
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.key]:
                              e.target.value,
                          })
                        }
                      />
                    );
                  }

                  return (
                    <Input
                      key={field.key}
                      label={field.label}
                      type={
                        field.type ||
                        'text'
                      }
                      value={
                        formData[
                          field.key
                        ] || ''
                      }
                      placeholder={
                        field.placeholder
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]:
                            e.target.value,
                        })
                      }
                    />
                  );
                })}
              </div>

              <div className="mt-6">
                <Button
                  onClick={
                    handleGenerate
                  }
                  className="w-full"
                >
                  <FileSignature className="w-4 h-4" />
                  إنشاء الوثيقة
                </Button>
              </div>
            </div>

            <div
              className="document-no-print"
              style={{
                alignSelf: 'start',
              }}
            >
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-bold text-navy-900 dark:text-white">
                      معاينة الوثيقة
                    </h2>

                    <p className="text-xs text-navy-500 mt-1">
                      ستظهر هنا بصيغة A4
                    </p>
                  </div>

                  {generated && (
                    <Badge variant="success">
                      جاهزة
                    </Badge>
                  )}
                </div>

                {!generated ? (
                  <div className="min-h-[350px] flex items-center justify-center text-center">
                    <div>
                      <FileText className="w-14 h-14 mx-auto text-navy-200 dark:text-navy-700 mb-4" />

                      <p className="text-sm text-navy-400">
                        أدخل البيانات واضغط
                        «إنشاء الوثيقة»
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={
                        handlePrint
                      }
                      className="w-full"
                    >
                      <Download className="w-4 h-4" />
                      طباعة / حفظ PDF
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={
                          handleDownload
                        }
                      >
                        <Download className="w-4 h-4" />
                        تحميل TXT
                      </Button>

                      <Button
                        variant="gold"
                        onClick={
                          handleSave
                        }
                        loading={saving}
                      >
                        <Save className="w-4 h-4" />
                        حفظ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {generated && (
          <div
            id="document-preview"
            className="mt-10"
          >
            <div
              id="document-print-area"
              className="document-paper"
              dir="rtl"
            >
              <div className="document-border">
                <div className="document-bismillah">
                  بسم الله الرحمن الرحيم
                </div>

                <div className="document-title">
                  {selectedTemplate?.title}
                </div>

                <div className="document-meta">
                  <span>
                    المملكة / الجمهورية اليمنية
                  </span>

                  <span>
                    التاريخ:
                    {' '}
                    {formatDate(
                      formData.date
                    )}
                  </span>
                </div>

                <div className="document-text">
                  {generated}
                </div>

                <div className="document-signatures">
                  <div className="document-signature">
                    الطرف الأول
                    <br />
                    <br />
                    الاسم: ......................
                    <br />
                    التوقيع:
                    __________________
                  </div>

                  <div className="document-signature">
                    الطرف الثاني
                    <br />
                    <br />
                    الاسم: ......................
                    <br />
                    التوقيع:
                    __________________
                  </div>
                </div>

                <div className="document-footer">
                  نموذج إعداد وثيقة قانونية عبر منصة SANAD
                  <br />
                  هذا النموذج لا يغني عن إجراءات التوثيق
                  والاعتماد لدى الجهة المختصة.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}