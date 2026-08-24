import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NAV_LINKS, ROLES } from '@/constants';
import { cn } from '@/utils';

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

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'lawyer' ? '/lawyer' : '/dashboard';

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      scrolled ? 'glass shadow-soft' : 'bg-transparent'
    )}>
      <nav className="container-page section-padding h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === link.path
                  ? 'text-royal-600 dark:text-royal-400 bg-royal-50 dark:bg-royal-900/20'
                  : 'text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800/50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="تبديل الوضع"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
              >
                <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
                <span className="text-sm font-medium text-navy-700 dark:text-navy-200 max-w-[100px] truncate">
                  {user.full_name || user.email}
                </span>
                <ChevronDown className="w-4 h-4 text-navy-400" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-56 card shadow-elevated p-2 z-50 animate-slide-down">
                    <div className="px-3 py-2 border-b border-navy-100 dark:border-navy-800 mb-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-navy-100 truncate">{user.full_name || user.email}</p>
                      <p className="text-xs text-navy-500">{ROLES[user.role]}</p>
                    </div>
                    <Link to={dashboardPath} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
                      <User className="w-4 h-4" /> الإعدادات
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn-ghost">تسجيل الدخول</Link>
              <Link to="/register" className="btn-primary">إنشاء حساب</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-navy-100 dark:border-navy-800 animate-slide-down">
          <div className="container-page section-padding py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'text-royal-600 dark:text-royal-400 bg-royal-50 dark:bg-royal-900/20'
                    : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashboardPath} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800">
                  لوحة التحكم
                </Link>
                <Link to="/settings" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800">
                  الإعدادات
                </Link>
                <button onClick={handleSignOut} className="w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary flex-1">تسجيل الدخول</Link>
                <Link to="/register" className="btn-primary flex-1">إنشاء حساب</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
