import { Link } from 'react-router-dom';
import { Scale, Bot, FileText, Users, BookOpen, MessageSquare, ArrowLeft, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/constants';

export function HomePage() {
  const features = [
    { icon: Bot, title: 'مساعد قانوني ذكي', desc: 'احصل على إجابات قانونية فورية مبنية على قاعدة بيانات القوانين اليمنية' },
    { icon: BookOpen, title: 'مكتبة القوانين', desc: 'تصفح وابحث في القوانين اليمنية وموادها القانونية بسهولة' },
    { icon: FileText, title: 'مولد الوثائق', desc: 'أنشئ وثائق قانونية احترافية بصيغة PDF — عقود، وكالات، إقرارات' },
    { icon: Users, title: 'دليل المحامين', desc: 'اعثر على محامين معتمدين متخصصين في مختلف المجالات القانونية' },
    { icon: MessageSquare, title: 'استشارات قانونية', desc: 'اطرح سؤالك القانوني واحصل على استشارة من محامٍ مختص' },
    { icon: Shield, title: 'بيانات آمنة', desc: 'حماية كاملة لبياناتك مع تشفير على مستوى قاعدة البيانات' },
  ];

  const stats = [
    { value: '٥+', label: 'قوانين يمنية' },
    { value: '٢٠+', label: 'مادة قانونية' },
    { value: '٨', label: 'أنواع وثائق' },
    { value: '٢٤/٧', label: 'متاح دائماً' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-royal-400 blur-3xl" />
        </div>
        <div className="relative container-page section-padding py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>منصة قانونية يمنية متكاملة</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              منصتك القانونية الذكية<br />
              <span className="text-gold-400">في اليمن</span>
            </h1>
            <p className="text-lg lg:text-xl text-navy-200 leading-relaxed mb-8 max-w-2xl">
              {APP_DESCRIPTION}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/assistant">
                <Button variant="gold" className="text-base px-7 py-3">
                  <Bot className="w-5 h-5" /> ابدأ استشارة قانونية
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="text-base px-7 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20">
                  إنشاء حساب مجاني
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="relative border-t border-white/10">
          <div className="container-page section-padding py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-bold text-gold-400">{s.value}</p>
                  <p className="text-sm text-navy-300 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page section-padding py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">لماذا SANAD؟</h2>
          <p className="text-navy-500 dark:text-navy-400 max-w-2xl mx-auto">
            نقدم لك مجموعة متكاملة من الأدوات القانونية الذكية لتلبية احتياجاتك القانونية
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-elevated transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-royal-600 dark:text-royal-400" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2">{f.title}</h3>
              <p className="text-sm text-navy-500 dark:text-navy-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="container-page section-padding py-20">
        <div className="gradient-royal rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gold-400/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-sm mb-4">
                <Zap className="w-4 h-4" /> مدعوم بالذكاء الاصطناعي
              </div>
              <h2 className="text-3xl font-bold mb-4">المساعد القانوني الذكي</h2>
              <p className="text-navy-100 leading-relaxed mb-6">
                اطرح سؤالك القانوني بالعربية، وسيقوم المساعد الذكي بتحليله والبحث في قاعدة بيانات القوانين اليمنية،
                ثم يعرض لك المادة القانونية ذات الصلة مع المصدر والمواد المشابهة.
              </p>
              <Link to="/assistant">
                <Button variant="gold" className="text-base px-6 py-3">
                  جرّب المساعد الآن <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {['تحليل السؤال واستخراج الكلمات المفتاحية', 'البحث في قاعدة بيانات القوانين اليمنية', 'عرض المادة القانونية مع المصدر', 'اقتراح محامٍ متخصص ووثيقة مناسبة'].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-gold-400 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page section-padding py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">كيف تعمل المنصة؟</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '١', title: 'أنشئ حساباً', desc: 'سجل في المنصة مجاناً واحصل على وصول كامل لجميع الخدمات' },
            { num: '٢', title: 'اطرح سؤالك', desc: 'استخدم المساعد الذكي أو احجز استشارة مع محامٍ معتمد' },
            { num: '٣', title: 'احصل على إجابتك', desc: 'استقبل إجابة قانونية مبنية على القوانين اليمنية مع المصادر' },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-500 to-navy-700 text-white text-2xl font-bold mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2">{step.title}</h3>
              <p className="text-sm text-navy-500 dark:text-navy-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page section-padding py-20">
        <div className="card p-8 lg:p-12 text-center bg-gradient-to-br from-navy-50 to-royal-50 dark:from-navy-900 dark:to-navy-800">
          <Scale className="w-12 h-12 text-royal-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">جاهز للبدء؟</h2>
          <p className="text-navy-500 dark:text-navy-400 mb-8 max-w-xl mx-auto">
            انضم إلى {APP_NAME} اليوم واحصل على استشارات قانونية ذكية، وثائق قانونية، ودليل محامين معتمدين.
          </p>
          <Link to="/register">
            <Button variant="primary" className="text-base px-8 py-3">
              إنشاء حساب مجاني
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
