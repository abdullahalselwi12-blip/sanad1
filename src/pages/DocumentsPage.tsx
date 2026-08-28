import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Download,
  FileSignature,
  FileText,
  Printer,
  Save,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { DOCUMENT_TYPES } from '@/constants';
import type { DocumentType } from '@/types';

/*
========================================================
 SANAD - Legal Document Generator
 مولد الوثائق القانونية
========================================================

 - يحافظ على Supabase
 - يحافظ على جدول documents
 - يحافظ على نظام تسجيل الدخول
 - يحافظ على أنواع الوثائق الحالية
 - متوافق مع الهاتف والكمبيوتر
 - لا يعرض ورقة A4 ضخمة داخل الهاتف
 - فتح / تحميل / طباعة / حفظ
========================================================
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

type Template = {
  key: TemplateKey;
  title: string;
  description: string;
  dbType: DocumentType;
};

/*
========================================================
 أنواع الوثائق
========================================================
*/

const TEMPLATE_TYPES: Template[] = [
  {
    key: 'marriage',
    title: 'عقد زواج',
    description:
      'إنشاء عقد زواج منظم ببيانات الأطراف والمهر والشهود.',
    dbType: 'marriage_contract',
  },

  {
    key: 'rental',
    title: 'عقد إيجار',
    description:
      'إنشاء عقد إيجار للعقار أو المنزل أو المحل.',
    dbType: 'rental_contract',
  },

  {
    key: 'sale',
    title: 'عقد بيع',
    description:
      'إنشاء عقد بيع منظم للمنقولات أو العقارات.',
    dbType: 'sale_contract',
  },

  {
    key: 'power',
    title: 'وكالة',
    description:
      'إنشاء وكالة وتحديد صلاحيات الوكيل.',
    dbType: 'power_of_attorney',
  },

  {
    key: 'declaration',
    title: 'إقرار وتعهد',
    description:
      'إنشاء إقرار أو تعهد مكتوب.',
    dbType: 'declaration',
  },

  {
    key: 'company',
    title: 'عقود الشركات',
    description:
      'إنشاء اتفاقية أو عقد منظم بين أطراف الشركة.',
    dbType: 'agreement',
  },

  {
    key: 'other',
    title: 'وثائق أخرى',
    description:
      'إنشاء وثيقة عامة قابلة للتخصيص والطباعة.',
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
      placeholder:
        'اكتب أي شروط إضافية متفق عليها',
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
      placeholder:
        'نوع العقار وموقعه ووصفه',
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
      placeholder:
        'شهري / سنوي / أخرى',
    },
    {
      key: 'conditions',
      label: 'الشروط',
      multiline: true,
      placeholder:
        'الشروط والالتزامات',
    },
    {
      key: 'location',
      label: 'مكان تحرير العقد',
      placeholder:
        'المدينة / المنطقة',
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
      placeholder:
        'وصف الشيء أو العقار المباع',
    },
    {
      key: 'price',
      label: 'الثمن',
      placeholder: 'قيمة البيع',
    },
    {
      key: 'payment',
      label: 'طريقة الدفع',
      placeholder:
        'نقدًا / تحويل / أقساط',
    },
    {
      key: 'date',
      label: 'تاريخ البيع',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان البيع',
      placeholder:
        'المدينة / المنطقة',
    },
    {
      key: 'conditions',
      label: 'الشروط الخاصة',
      multiline: true,
      placeholder:
        'أي شروط إضافية',
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
      placeholder:
        'اكتب الصلاحيات الممنوحة للوكيل بالتفصيل',
    },
    {
      key: 'duration',
      label: 'مدة الوكالة',
      placeholder:
        'مثال: حتى تاريخ...',
    },
    {
      key: 'date',
      label: 'تاريخ الوكالة',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان تحرير الوكالة',
      placeholder:
        'المدينة / المنطقة',
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
      placeholder:
        'رقم البطاقة الشخصية',
    },
    {
      key: 'address',
      label: 'العنوان',
      placeholder: 'العنوان',
    },
    {
      key: 'subject',
      label: 'موضوع الإقرار',
      placeholder:
        'موضوع الإقرار',
    },
    {
      key: 'content',
      label: 'نص الإقرار والتعهد',
      multiline: true,
      placeholder:
        'اكتب نص الإقرار والتعهد بالتفصيل',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان الإقرار',
      placeholder:
        'المدينة / المنطقة',
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
      placeholder:
        'نوع الشركة',
    },
    {
      key: 'party1',
      label: 'الطرف الأول',
      placeholder:
        'اسم الطرف الأول',
    },
    {
      key: 'party1_id',
      label: 'هوية الطرف الأول',
      placeholder:
        'رقم الهوية',
    },
    {
      key: 'party2',
      label: 'الطرف الثاني',
      placeholder:
        'اسم الطرف الثاني',
    },
    {
      key: 'party2_id',
      label: 'هوية الطرف الثاني',
      placeholder:
        'رقم الهوية',
    },
    {
      key: 'subject',
      label: 'موضوع العقد',
      multiline: true,
      placeholder:
        'موضوع العقد أو الاتفاقية',
    },
    {
      key: 'capital',
      label: 'رأس المال',
      placeholder:
        'قيمة رأس المال',
    },
    {
      key: 'shares',
      label: 'نسبة الشراكة',
      placeholder:
        'مثال: 50% / 50%',
    },
    {
      key: 'responsibilities',
      label: 'المسؤوليات',
      multiline: true,
      placeholder:
        'مسؤوليات كل طرف',
    },
    {
      key: 'terms',
      label: 'الشروط',
      multiline: true,
      placeholder:
        'الشروط والأحكام',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'مكان العقد',
      placeholder:
        'المدينة / المنطقة',
    },
  ],

  other: [
    {
      key: 'document_title',
      label: 'عنوان الوثيقة',
      placeholder:
        'مثال: إنذار قانوني',
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
      placeholder:
        'موضوع الوثيقة',
    },
    {
      key: 'content',
      label: 'محتوى الوثيقة',
      multiline: true,
      placeholder:
        'اكتب محتوى الوثيقة بالتفصيل',
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
    {
      key: 'location',
      label: 'المكان',
      placeholder:
        'المدينة / المنطقة',
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
) => {
  return data[key]?.trim() || '................................';
};

const formatDate = (date?: string) => {
  if (!date) return '................';

  try {
    return new Intl.DateTimeFormat(
      'ar-YE',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    ).format(new Date(date));
  } catch {
    return date;
  }
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
 إنشاء HTML احترافي للوثيقة
========================================================
*/

const buildDocumentHtml = (
  title: string,
  generated: string,
  date?: string
) => {
  const safeTitle = escapeHtml(title);
  const safeGenerated = escapeHtml(generated);
  const safeDate = escapeHtml(formatDate(date));

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>${safeTitle} - SANAD</title>

<style>

@import url(
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap'
);

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #f8f7f4;
  color: #1f1e1c;
  font-family:
    'Tajawal',
    Tahoma,
    Arial,
    sans-serif;
}

body {
  min-height: 100vh;
}

/* =========================================
   Toolbar
========================================= */

.toolbar {
  position: sticky;
  top: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  flex-wrap: wrap;

  padding: 14px;

  background: rgba(255,255,255,.96);

  border-bottom:
    1px solid #e6e3de;

  backdrop-filter:
    blur(14px);
}

.toolbar button {
  min-height: 44px;

  border: 0;

  border-radius: 10px;

  padding:
    10px 18px;

  cursor: pointer;

  font-family:
    'Tajawal',
    Tahoma,
    Arial,
    sans-serif;

  font-size: 14px;

  font-weight: 700;

  transition:
    .2s ease;
}

.print-button {
  background: #71806a;
  color: white;
}

.print-button:hover {
  background: #5f6e59;
}

.close-button {
  background: #f1efeb;
  color: #292725;
}

.close-button:hover {
  background: #e6e3de;
}

/* =========================================
   Page
========================================= */

.document-wrapper {
  width: 100%;

  padding:
    24px 12px 50px;
}

.document-page {
  width:
    min(210mm, 100%);

  min-height:
    297mm;

  margin:
    0 auto;

  padding:
    14mm;

  background:
    #ffffff;

  border:
    1px solid #dedad4;

  box-shadow:
    0 18px 50px
    rgba(41,39,37,.10);
}

.document-border {
  min-height:
    268mm;

  border:
    1px solid #77736e;

  padding:
    10mm;
}

/* =========================================
   Header
========================================= */

.document-header {
  text-align: center;

  margin-bottom:
    22px;
}

.bismillah {
  font-family:
    'Tajawal',
    Tahoma,
    Arial,
    sans-serif;

  font-size:
    17px;

  font-weight:
    700;

  margin-bottom:
    10px;
}

.document-title {
  margin:
    0;

  color:
    #292725;

  font-size:
    24px;

  line-height:
    1.6;

  font-weight:
    900;

  text-decoration:
    underline;

  text-underline-offset:
    5px;
}

/* =========================================
   Meta
========================================= */

.document-meta {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    20px;

  flex-wrap:
    wrap;

  margin:
    20px 0;

  padding:
    10px 0;

  border-top:
    1px solid #e6e3de;

  border-bottom:
    1px solid #e6e3de;

  font-size:
    12px;

  color:
    #5f5a55;
}

/* =========================================
   Content
========================================= */

.document-content {
  white-space:
    pre-line;

  color:
    #1f1e1c;

  font-size:
    13px;

  line-height:
    2.15;

  text-align:
    justify;

  overflow-wrap:
    anywhere;
}

/* =========================================
   Signatures
========================================= */

.signatures {
  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    30px;

  margin-top:
    55px;

  text-align:
    center;

  font-size:
    12px;

  line-height:
    1.8;
}

.signature-box {
  min-height:
    75px;
}

/* =========================================
   Footer
========================================= */

.document-footer {
  margin-top:
    35px;

  padding-top:
    10px;

  border-top:
    1px solid #bdb8b1;

  text-align:
    center;

  color:
    #77736e;

  font-size:
    9px;

  line-height:
    1.7;
}

/* =========================================
   Mobile
========================================= */

@media (max-width: 600px) {

  .toolbar {
    padding:
      10px;

    gap:
      8px;
  }

  .toolbar button {
    flex:
      1 1 140px;

    min-width:
      120px;

    padding:
      10px 12px;
  }

  .document-wrapper {
    padding:
      8px;
  }

  .document-page {
    width:
      100%;

    min-height:
      auto;

    padding:
      6mm;

    box-shadow:
      0 8px 25px
      rgba(41,39,37,.07);
  }

  .document-border {
    min-height:
      auto;

    padding:
      6mm;
  }

  .document-title {
    font-size:
      20px;
  }

  .bismillah {
    font-size:
      15px;
  }

  .document-meta {
    flex-direction:
      column;

    gap:
      8px;

    font-size:
      11px;
  }

  .document-content {
    font-size:
      12px;

    line-height:
      1.95;
  }

  .signatures {
    grid-template-columns:
      1fr;

    gap:
      28px;

    margin-top:
      40px;
  }
}

/* =========================================
   Print
========================================= */

@page {
  size:
    A4;

  margin:
    13mm;
}

@media print {

  html,
  body {
    background:
      white;
  }

  .toolbar {
    display:
      none;
  }

  .document-wrapper {
    padding:
      0;
  }

  .document-page {
    width:
      210mm;

    min-height:
      297mm;

    margin:
      0;

    padding:
      0;

    border:
      0;

    box-shadow:
      none;
  }

  .document-border {
    min-height:
      270mm;

    border:
      1px solid #333;

    padding:
      10mm;
  }

}

</style>

</head>

<body>

<div class="toolbar">

  <button
    class="print-button"
    onclick="window.print()"
  >
    🖨 طباعة / حفظ PDF
  </button>

  <button
    class="close-button"
    onclick="window.close()"
  >
    إغلاق
  </button>

</div>

<main class="document-wrapper">

  <article class="document-page">

    <div class="document-border">

      <header class="document-header">

        <div class="bismillah">
          بسم الله الرحمن الرحيم
        </div>

        <h1 class="document-title">
          ${safeTitle}
        </h1>

      </header>

      <div class="document-meta">

        <span>
          الجمهورية اليمنية
        </span>

        <span>
          التاريخ:
          ${safeDate}
        </span>

      </div>

      <section class="document-content">
        ${safeGenerated}
      </section>

      <section class="signatures">

        <div class="signature-box">

          الطرف الأول

          <br />
          <br />

          الاسم:
          __________________

          <br />

          التوقيع:
          __________________

        </div>

        <div class="signature-box">

          الطرف الثاني

          <br />
          <br />

          الاسم:
          __________________

          <br />

          التوقيع:
          __________________

        </div>

      </section>

      <footer class="document-footer">

        نموذج إعداد وثيقة قانونية عبر منصة SANAD

        <br />

        هذا النموذج مخصص لإعداد الوثيقة
        ولا يغني عن إجراءات التوثيق والاعتماد
        لدى الجهة المختصة.

      </footer>

    </div>

  </article>

</main>

</body>

</html>
`;
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

  const { user } =
    useAuth();

  const { toast } =
    useToast();

  const selectedTemplate =
    TEMPLATE_TYPES.find(
      (item) =>
        item.key === selectedType
    );

  /*
  ======================================================
  إنشاء الوثيقة
  ======================================================
  */

  const handleGenerate = () => {
    if (!selectedType) {
      return;
    }

    const requiredFields =
      DOC_FIELDS[selectedType];

    const missing =
      requiredFields
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
        .getElementById(
          'document-result'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  /*
  ======================================================
  فتح الوثيقة
  ======================================================
  */

  const handleOpen = () => {
    if (!generated || !selectedTemplate) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );

      return;
    }

    const documentWindow =
      window.open(
        '',
        '_blank',
        'width=1000,height=900'
      );

    if (!documentWindow) {
      toast(
        'يرجى السماح بفتح النوافذ المنبثقة',
        'warning'
      );

      return;
    }

    documentWindow.document.open();

    documentWindow.document.write(
      buildDocumentHtml(
        selectedTemplate.title,
        generated,
        formData.date
      )
    );

    documentWindow.document.close();
  };

  /*
  ======================================================
  الطباعة
  ======================================================
  */

  const handlePrint = () => {
    if (!generated || !selectedTemplate) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );

      return;
    }

    const printWindow =
      window.open(
        '',
        '_blank',
        'width=1000,height=900'
      );

    if (!printWindow) {
      toast(
        'يرجى السماح بفتح النوافذ المنبثقة',
        'warning'
      );

      return;
    }

    printWindow.document.open();

    printWindow.document.write(
      buildDocumentHtml(
        selectedTemplate.title,
        generated,
        formData.date
      )
    );

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 350);
    };
  };

  /*
  ======================================================
  تحميل HTML
  ======================================================
  */

  const handleDownload = () => {
    if (!generated || !selectedTemplate) {
      toast(
        'أنشئ الوثيقة أولاً',
        'warning'
      );

      return;
    }

    const html =
      buildDocumentHtml(
        selectedTemplate.title,
        generated,
        formData.date
      );

    const blob =
      new Blob(
        [html],
        {
          type:
            'text/html;charset=utf-8',
        }
      );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;

    anchor.download =
      `${selectedTemplate.title}-SANAD.html`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    toast(
      'تم تحميل الوثيقة بنجاح',
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
            user_id:
              user.id,

            type:
              selectedTemplate.dbType,

            title:
              selectedTemplate.title,

            content:
              generated,

            data:
              formData,
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
        className="
          container-page
          section-padding
          py-8
          sm:py-12
        "
      >

        {/* Header */}

        <div className="mb-8">

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#EEF1EB]
                text-[#71806A]
              "
            >
              <FileText
                className="h-6 w-6"
              />
            </div>

            <div>

              <h1
                className="
                  text-2xl
                  font-black
                  text-[#292725]
                  dark:text-white
                  sm:text-3xl
                "
              >
                مولد الوثائق القانونية
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[#77736E]
                  dark:text-navy-400
                "
              >
                أنشئ وثائق قانونية منظمة
                وأدخل بياناتك ثم راجعها
                واطبعها أو احفظها.
              </p>

            </div>

          </div>

        </div>

        {/* Document cards */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >

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
                className="
                  group
                  min-w-0
                  rounded-2xl
                  border
                  border-[#E6E3DE]
                  bg-white
                  p-5
                  text-right
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-[#71806A]
                  hover:shadow-[0_12px_30px_rgba(41,39,37,.08)]
                  dark:border-navy-800
                  dark:bg-navy-900
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#F0F2EE]
                    text-[#71806A]
                    transition-transform
                    group-hover:scale-105
                  "
                >
                  <FileSignature
                    className="h-5 w-5"
                  />
                </div>

                <h2
                  className="
                    text-base
                    font-bold
                    text-[#292725]
                    dark:text-white
                  "
                >
                  {template.title}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#77736E]
                    dark:text-navy-400
                  "
                >
                  {template.description}
                </p>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-[#71806A]
                  "
                >
                  <span>
                    إنشاء الوثيقة
                  </span>

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      rotate-180
                      transition-transform
                      group-hover:-translate-x-1
                    "
                  />
                </div>

              </button>
            )
          )}

        </div>

        {/* Notice */}

        <div
          className="
            mt-8
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-[#E6E3DE]
            bg-white
            p-4
            dark:border-navy-800
            dark:bg-navy-900
          "
        >

          <ShieldCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-[#71806A]
            "
          />

          <p
            className="
              text-xs
              leading-6
              text-[#77736E]
              dark:text-navy-400
            "
          >
            النماذج التي تنشئها منصة SANAD
            مخصصة لإعداد الوثائق القانونية
            والطباعة، ولا تصبح وثائق حكومية
            رسمية إلا بعد استكمال إجراءات
            الاعتماد والتوثيق لدى الجهة
            المختصة.
          </p>

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
    <div
      dir="rtl"
      className="
        container-page
        section-padding
        w-full
        max-w-full
        overflow-x-hidden
        py-6
        sm:py-10
      "
    >

      {/* Back */}

      <button
        type="button"
        onClick={handleBack}
        className="
          mb-5
          inline-flex
          min-h-[44px]
          items-center
          gap-2
          rounded-xl
          px-2
          text-sm
          font-medium
          text-[#77736E]
          transition-colors
          hover:text-[#292725]
          dark:hover:text-white
        "
      >

        <ArrowRight
          className="
            h-4
            w-4
          "
        />

        العودة إلى أنواع الوثائق

      </button>

      {/* Header */}

      <div
        className="
          mb-6
          min-w-0
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          <h1
            className="
              min-w-0
              text-2xl
              font-black
              text-[#292725]
              dark:text-white
              sm:text-3xl
            "
          >
            {selectedTemplate?.title}
          </h1>

          <Badge variant="success">
            جاهز للإنشاء
          </Badge>

        </div>

        <p
          className="
            mt-2
            text-sm
            text-[#77736E]
            dark:text-navy-400
          "
        >
          أدخل البيانات المطلوبة ثم أنشئ
          الوثيقة لمراجعتها أو طباعتها.
        </p>

      </div>

      {/* Main editor */}

      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-6
          lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]
        "
      >

        {/* Form */}

        <section
          className="
            min-w-0
            rounded-2xl
            border
            border-[#E6E3DE]
            bg-white
            p-4
            shadow-sm
            sm:p-6
            dark:border-navy-800
            dark:bg-navy-900
          "
        >

          <div
            className="
              mb-5
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#EEF1EB]
                text-[#71806A]
              "
            >
              <FileSignature
                className="h-5 w-5"
              />
            </div>

            <div>

              <h2
                className="
                  text-base
                  font-bold
                  text-[#292725]
                  dark:text-white
                "
              >
                بيانات الوثيقة
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#77736E]
                  dark:text-navy-400
                "
              >
                املأ البيانات المطلوبة بدقة
              </p>

            </div>

          </div>

          <div
            className="
              grid
              min-w-0
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >

            {DOC_FIELDS[selectedType].map(
              (field) => {

                if (field.multiline) {
                  return (
                    <div
                      key={field.key}
                      className="min-w-0 sm:col-span-2"
                    >

                      <Textarea
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

                    </div>
                  );
                }

                return (
                  <div
                    key={field.key}
                    className="min-w-0"
                  >

                    <Input
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

                  </div>
                );
              }
            )}

          </div>

          {/* Generate */}

          <div className="mt-6">

            <Button
              onClick={handleGenerate}
              className="
                w-full
                !bg-[#71806A]
                hover:!bg-[#5F6E59]
              "
            >

              <FileSignature
                className="h-4 w-4"
              />

              إنشاء الوثيقة

            </Button>

          </div>

        </section>

        {/* Result panel */}

        <section
          id="document-result"
          className="
            min-w-0
            self-start
            rounded-2xl
            border
            border-[#E6E3DE]
            bg-white
            shadow-sm
            dark:border-navy-800
            dark:bg-navy-900
          "
        >

          {/* Result header */}

          <div
            className="
              border-b
              border-[#E6E3DE]
              p-4
              sm:p-5
              dark:border-navy-800
            "
          >

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#F0F2EE]
                  text-[#71806A]
                "
              >
                <FileText
                  className="h-5 w-5"
                />
              </div>

              <div className="min-w-0">

                <h2
                  className="
                    truncate
                    text-base
                    font-bold
                    text-[#292725]
                    dark:text-white
                  "
                >
                  نتيجة الوثيقة
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#77736E]
                    dark:text-navy-400
                  "
                >
                  {generated
                    ? 'الوثيقة جاهزة للتعامل معها'
                    : 'ستظهر النتيجة بعد الإنشاء'}
                </p>

              </div>

              {generated && (
                <span
                  className="
                    mr-auto
                    inline-flex
                    shrink-0
                    items-center
                    gap-1
                    rounded-full
                    bg-[#EEF1EB]
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-[#5F6E59]
                  "
                >

                  <CheckCircle
                    className="h-3.5 w-3.5"
                  />

                  جاهزة

                </span>
              )}

            </div>

          </div>

          {!generated ? (

            /* Empty result */

            <div
              className="
                flex
                min-h-[280px]
                items-center
                justify-center
                p-6
                text-center
              "
            >

              <div>

                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#F8F7F4]
                    text-[#9A958E]
                  "
                >

                  <FileText
                    className="h-7 w-7"
                  />

                </div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-[#292725]
                    dark:text-white
                  "
                >
                  لم يتم إنشاء الوثيقة بعد
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-xs
                    text-xs
                    leading-6
                    text-[#77736E]
                    dark:text-navy-400
                  "
                >
                  أدخل البيانات المطلوبة
                  ثم اضغط على «إنشاء الوثيقة»
                  وستظهر لك خيارات الوثيقة هنا.
                </p>

              </div>

            </div>

          ) : (

            /* Generated */

            <div className="p-4 sm:p-5">

              {/* Small document summary */}

              <div
                className="
                  rounded-xl
                  bg-[#F8F7F4]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white
                      text-[#71806A]
                    "
                  >

                    <FileSignature
                      className="h-5 w-5"
                    />

                  </div>

                  <div className="min-w-0">

                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-[#292725]
                      "
                    >
                      {selectedTemplate?.title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[#77736E]
                      "
                    >
                      صيغة قانونية قابلة للطباعة
                    </p>

                  </div>

                </div>

              </div>

              {/* Actions */}

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-2
                "
              >

                {/* Open */}

                <button
                  type="button"
                  onClick={handleOpen}
                  className="
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#E0DDD7]
                    bg-white
                    px-3
                    text-sm
                    font-bold
                    text-[#292725]
                    transition
                    hover:border-[#71806A]
                    hover:bg-[#F8F7F4]
                  "
                >

                  <FileText
                    className="h-4 w-4 text-[#71806A]"
                  />

                  فتح

                </button>

                {/* Download */}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#292725]
                    px-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-[#3A3835]
                  "
                >

                  <Download
                    className="h-4 w-4"
                  />

                  تحميل

                </button>

                {/* Print */}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#71806A]
                    px-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-[#5F6E59]
                  "
                >

                  <Printer
                    className="h-4 w-4"
                  />

                  طباعة

                </button>

                {/* Save */}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#DCC99F]
                    bg-[#F8F0DF]
                    px-3
                    text-sm
                    font-bold
                    text-[#6A532B]
                    transition
                    hover:bg-[#F2E7CF]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <Save
                    className="h-4 w-4"
                  />

                  {saving
                    ? 'جاري الحفظ...'
                    : 'حفظ'}

                </button>

              </div>

              {/* Help */}

              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-2
                  rounded-xl
                  border
                  border-[#E6E3DE]
                  bg-white
                  p-3
                "
              >

                <ShieldCheck
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[#71806A]
                  "
                />

                <p
                  className="
                    text-xs
                    leading-6
                    text-[#77736E]
                  "
                >
                  يمكنك فتح الوثيقة لمراجعتها،
                  أو تحميل نسخة HTML، أو طباعتها
                  مباشرة وحفظها كملف PDF من نافذة
                  الطباعة.
                </p>

              </div>

            </div>

          )}

        </section>

      </div>

      {/* Legal note */}

      <div
        className="
          mt-6
          rounded-2xl
          border
          border-[#E6E3DE]
          bg-[#FCFBF9]
          p-4
          dark:border-navy-800
          dark:bg-navy-900
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <ShieldCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-[#71806A]
            "
          />

          <div>

            <p
              className="
                text-sm
                font-bold
                text-[#292725]
                dark:text-white
              "
            >
              تنبيه قانوني
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-6
                text-[#77736E]
                dark:text-navy-400
              "
            >
              الوثيقة الناتجة هي نموذج لإعداد
              المحتوى القانوني. يجب مراجعة
              الوثيقة والتأكد من البيانات واستكمال
              إجراءات التوثيق والاعتماد لدى الجهة
              المختصة عند الحاجة.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}