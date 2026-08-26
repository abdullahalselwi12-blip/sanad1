import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Home,
  Scale,
  Bot,
  Users,
  MessageSquare,
  FileText,
  Newspaper,
  Bell,
  Settings,
  Search,
  Heart,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NAV_LINKS, ROLES } from '@/constants';
import { cn } from '@/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  '/': Home,
  '/laws': Scale,
  '/assistant': Bot,
  '/lawyers': Users,
  '/consultations': MessageSquare,
  '/documents': FileText,
  '/news': Newspaper,
  '/notifications': Bell,
  '/search': Search,
  '/favorites': Heart,
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'lawyer'
        ? '/lawyer'
        : '/dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-[#071A2B]/95 backdrop-blur-md border-b border-[#173F5F] shadow-lg'
          : 'bg-[#071A2B]/95 backdrop-blur-sm'
      )}
    >
      <nav
        className="container-page section-padding h-16 flex items-center justify-between"
        aria-label="التنقل الرئيسي"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C35A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071A2B]"
          aria-label="SANAD - الصفحة الرئيسية"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = ICON_MAP[link.path] || FileText;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C35A]',
                  isActive
                    ? 'text-[#D8B96A] bg-[#0D2942] border border-[#173F5F]'
                    : 'text-[#B8C2CC] hover:text-[#E6C35A] hover:bg-[#0D2942]'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-[#D8B96A]' : 'text-[#B8C2CC]'
                  )}
                  aria-hidden="true"
                />

                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="الإشعارات"
            title="الإشعارات"
            className="
              relative
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              rounded-lg
              text-[#B8C2CC]
              hover:text-[#E6C35A]
              hover:bg-[#0D2942]
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E6C35A]
            "
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Theme Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? 'تفعيل الوضع الفاتح'
                : 'تفعيل الوضع الداكن'
            }
            className="
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              rounded-lg
              text-[#B8C2CC]
              hover:text-[#E6C35A]
              hover:bg-[#0D2942]
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E6C35A]
            "
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* User */}
          {user ? (
            <div className="relative hidden sm:block">

              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="فتح قائمة المستخدم"
                className="
                  min-h-[44px]
                  flex items-center gap-2
                  p-1 pr-2
                  rounded-lg
                  hover:bg-[#0D2942]
                  transition-colors
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#E6C35A]
                "
              >
                <Avatar
                  name={user.full_name}
                  src={user.avatar_url}
                  size="sm"
                />

                <span className="text-sm font-medium text-[#F5F7FA] max-w-[100px] truncate">
                  {user.full_name || user.email}
                </span>

                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-[#B8C2CC] transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    className="
                      absolute left-0 mt-2 w-56
                      rounded-xl
                      bg-[#0D2942]
                      border border-[#173F5F]
                      shadow-2xl
                      p-2 z-50
                      animate-slide-down
                    "
                    role="menu"
                  >
                    {/* User Information */}
                    <div className="px-3 py-2 border-b border-[#173F5F] mb-1">
                      <p className="text-sm font-medium text-[#F5F7FA] truncate">
                        {user.full_name || user.email}
                      </p>

                      <p className="text-xs text-[#B8C2CC]">
                        {ROLES[user.role]}
                      </p>
                    </div>

                    {/* Dashboard */}
                    <Link
                      to={dashboardPath}
                      role="menuitem"
                      className="
                        flex items-center gap-2
                        min-h-[44px]
                        px-3 py-2
                        rounded-lg
                        text-sm
                        text-[#B8C2CC]
                        hover:text-[#E6C35A]
                        hover:bg-[#173F5F]
                        transition-colors
                      "
                    >
                      <LayoutDashboard
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                      <span>لوحة التحكم</span>
                    </Link>

                    {/* Settings */}
                    <Link
                      to="/settings"
                      role="menuitem"
                      className="
                        flex items-center gap-2
                        min-h-[44px]
                        px-3 py-2
                        rounded-lg
                        text-sm
                        text-[#B8C2CC]
                        hover:text-[#E6C35A]
                        hover:bg-[#173F5F]
                        transition-colors
                      "
                    >
                      <Settings
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                      <span>الإعدادات</span>
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      role="menuitem"
                      className="
                        w-full
                        min-h-[44px]
                        flex items-center gap-2
                        px-3 py-2
                        rounded-lg
                        text-sm
                        text-[#C44545]
                        hover:bg-[#C44545]/10
                        transition-colors
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#C44545]
                      "
                    >
                      <LogOut
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">

              <Link
                to="/login"
                className="btn-ghost min-h-[44px]"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                تسجيل الدخول
              </Link>

              <Link
                to="/register"
                className="btn-primary min-h-[44px]"
              >
                إنشاء حساب
              </Link>

            </div>
          )}

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={
              mobileOpen
                ? 'إغلاق القائمة'
                : 'فتح القائمة'
            }
            aria-expanded={mobileOpen}
            className="
              lg:hidden
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              rounded-lg
              text-[#B8C2CC]
              hover:text-[#E6C35A]
              hover:bg-[#0D2942]
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E6C35A]
            "
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="
            lg:hidden
            bg-[#071A2B]/98
            backdrop-blur-md
            border-t border-[#173F5F]
            animate-slide-down
          "
        >
          <div className="container-page section-padding py-4 space-y-1">

            {NAV_LINKS.map((link) => {
              const Icon = ICON_MAP[link.path] || FileText;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'min-h-[48px] flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C35A]',
                    isActive
                      ? 'text-[#D8B96A] bg-[#0D2942]'
                      : 'text-[#B8C2CC] hover:text-[#E6C35A] hover:bg-[#0D2942]'
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    aria-hidden="true"
                  />

                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="
                    min-h-[48px]
                    flex items-center gap-3
                    px-4 py-2.5
                    rounded-lg
                    text-sm font-medium
                    text-[#B8C2CC]
                    hover:text-[#E6C35A]
                    hover:bg-[#0D2942]
                  "
                >
                  <LayoutDashboard
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  لوحة التحكم
                </Link>

                <Link
                  to="/settings"
                  className="
                    min-h-[48px]
                    flex items-center gap-3
                    px-4 py-2.5
                    rounded-lg
                    text-sm font-medium
                    text-[#B8C2CC]
                    hover:text-[#E6C35A]
                    hover:bg-[#0D2942]
                  "
                >
                  <Settings
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  الإعدادات
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="
                    w-full
                    min-h-[48px]
                    flex items-center gap-3
                    px-4 py-2.5
                    rounded-lg
                    text-sm font-medium
                    text-[#C44545]
                    hover:bg-[#C44545]/10
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C44545]
                  "
                >
                  <LogOut
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">

                <Link
                  to="/login"
                  className="btn-secondary flex-1 min-h-[48px]"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  تسجيل الدخول
                </Link>

                <Link
                  to="/register"
                  className="btn-primary flex-1 min-h-[48px]"
                >
                  إنشاء حساب
                </Link>

              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}