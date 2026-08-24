import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Sun, Moon, ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ADMIN_NAV, ROLES } from '@/constants';
import { cn } from '@/utils';
import * as Icons from 'lucide-react';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950 flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 right-0 z-40 h-screen w-64 bg-navy-900 text-navy-100 border-l border-navy-800 transition-transform duration-300 flex flex-col',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800">
          <Logo className="text-white" size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-navy-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 mb-2 text-xs font-semibold text-navy-500 uppercase tracking-wider">لوحة الإدارة</p>
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] || Icons.Circle;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-royal-600 text-white'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-navy-800 p-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors">
            <Home className="w-4 h-4" /> الصفحة الرئيسية
          </Link>
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-400 hover:bg-error-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-navy-100 dark:border-navy-800 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-navy-600 dark:text-navy-300">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-navy-400">
            <span>لوحة الإدارة</span>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-navy-700 dark:text-navy-200 font-medium">
              {ADMIN_NAV.find((n) => n.path === location.pathname)?.label || 'لوحة المعلومات'}
            </span>
          </div>
          <Link to="/settings" className="flex items-center gap-2">
            <Avatar name={user?.full_name} src={user?.avatar_url} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-navy-700 dark:text-navy-200 max-w-[120px] truncate">{user?.full_name || user?.email}</p>
              <p className="text-xs text-gold-600">{user ? ROLES[user.role] : ''}</p>
            </div>
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
