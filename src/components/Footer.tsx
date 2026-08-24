import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { NAV_LINKS } from '@/constants';

export function Footer() {
  return (
    <footer className="gradient-navy text-navy-100 mt-20">
      <div className="container-page section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-navy-300 leading-relaxed">
              منصتك القانونية الذكية في اليمن. نقدم الاستشارات القانونية، مكتبة القوانين، ومولد الوثائق القانونية.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-navy-300 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">صفحات مهمة</h3>
            <ul className="space-y-2">
              <li><Link to="/page/about" className="text-sm text-navy-300 hover:text-gold-400 transition-colors">عن المنصة</Link></li>
              <li><Link to="/page/privacy" className="text-sm text-navy-300 hover:text-gold-400 transition-colors">سياسة الخصوصية</Link></li>
              <li><Link to="/page/terms" className="text-sm text-navy-300 hover:text-gold-400 transition-colors">الشروط والأحكام</Link></li>
              <li><Link to="/page/contact" className="text-sm text-navy-300 hover:text-gold-400 transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-navy-300">
                <Mail className="w-4 h-4 text-gold-400" /> abdullah1@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-navy-300">
                <Phone className="w-4 h-4 text-gold-400" /> +967 782799796
              </li>
              <li className="flex items-center gap-2 text-sm text-navy-300">
                <MapPin className="w-4 h-4 text-gold-400" /> صنعاء، اليمن
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-400">© 2026 SANAD. جميع الحقوق محفوظة.</p>
          <p className="text-sm text-navy-400 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-gold-400" /> منصة قانونية يمنية
          </p>
        </div>
      </div>
    </footer>
  );
}
