import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileUp,
  MessageSquare,
  LayoutDashboard,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  badge?: number;
}> = ({ icon, label, path, active, badge }) => (
  <Link
    to={path}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {badge && (
      <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </Link>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <BarChart3 size={20} />, label: 'لوحة التحكم', path: '/' },
    { icon: <FileUp size={20} />, label: 'رفع الملفات', path: '/upload' },
    { icon: <MessageSquare size={20} />, label: 'المحادثة', path: '/chat' },
    { icon: <LayoutDashboard size={20} />, label: 'التقارير', path: '/dashboards' },
    { icon: <CreditCard size={20} />, label: 'الاشتراكات', path: '/pricing' },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg">DataAI</span>
        </div>
        <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">DataAI</h1>
              <p className="text-xs text-gray-400">محلل البيانات الذكي</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-gray-800">
          <div className="relative">
            <div
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 cursor-pointer hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{user?.username || 'مستخدم'}</p>
                <p className="text-xs text-gray-400">{user?.email || ''}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </div>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings size={16} />
                  <span>الإعدادات</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
