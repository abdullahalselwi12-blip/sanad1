import { Outlet } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-royal-400 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo className="text-white" />
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              منصتك القانونية الذكية<br />في اليمن
            </h1>
            <p className="text-lg text-navy-200 leading-relaxed max-w-md">
              استشارات قانونية ذكية، مكتبة قوانين شاملة، مولد وثائق قانونية، ودليل محامين معتمدين — كل ذلك في مكان واحد.
            </p>
            <div className="mt-8 space-y-3">
              {['مساعد قانوني ذكي', 'مكتبة قوانين يمنية', 'مولد وثائق PDF', 'دليل محامين معتمدين'].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-navy-200">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-navy-400">© 2026 SANAD. جميع الحقوق محفوظة.</p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-navy-50 dark:bg-navy-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
