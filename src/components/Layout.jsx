import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { 
  Home, 
  User, 
  Settings, 
  Target, 
  Shield, 
  Sun,
  Moon,
  ChevronUp
} from 'lucide-react';

export default function Layout() {
  const { theme, toggle } = useTheme();
  const { language } = useLanguage();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const isActive = (paths) => paths.includes(location.pathname);

  const navItems = [
    { path: '/feed', label: 'nav.feed', icon: Home },
    { path: '/profile', label: 'nav.profile', icon: User, altPaths: ['/achievements', '/edit-profile'] },
    { path: '/quests', label: 'nav.quests', icon: Target },
    { path: '/clans', label: 'nav.clans', icon: Shield, altPaths: ['/clan-leaderboard', '/leaderboard'] },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-500 overflow-x-hidden relative pb-20 md:pb-0`}>
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full blur-[120px] opacity-10 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
        <div className={`absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-15 ${theme === 'dark' ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
      </div>

      {/* Desktop Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 hidden md:block ${theme === 'dark' ? 'bg-gray-950/70 border-gray-800' : 'bg-gray-50/70 border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/feed')}>
            <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint" className="w-8 h-8 transition-transform group-hover:scale-110" />
            <h1 className="text-xl font-bold tracking-tight">Kint</h1>
          </div>

          <div className="flex gap-1 items-center bg-gray-50/50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            {navItems.map(item => {
              const active = isActive([item.path, ...(item.altPaths || [])]);
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${active 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t(item.label, language)}
                </Link>
              );
            })}
            {currentUser?.isAdmin && (
              <Link 
                to="/admin" 
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isActive(['/admin']) 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Shield size={14} className="inline mr-1" />{t('admin.adminPanel', language)}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/settings" aria-label="Settings" className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 shadow-sm'}`}><Settings size={18} /></Link>
            <button onClick={toggle} aria-label="Toggle Theme" className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-900 text-yellow-400 hover:bg-gray-800' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 shadow-sm'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="ml-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:scale-105 transition-all">
              {t('nav.signOut', language)}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b px-4 h-16 flex items-center justify-between ${theme === 'dark' ? 'bg-gray-950/70 border-gray-800' : 'bg-gray-50/70 border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint" className="w-8 h-8" />
          <h1 className="text-lg font-bold">Kint</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" aria-label="Settings" className="p-2 rounded-lg bg-gray-500/5 text-gray-500"><Settings size={18} /></Link>
          <button onClick={toggle} aria-label="Toggle Theme" className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t safe-bottom transition-all duration-300 ${theme === 'dark' ? 'bg-gray-950/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map(item => {
            const active = isActive([item.path, ...(item.altPaths || [])]);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex flex-col items-center justify-center gap-1 w-16 transition-all ${active ? 'text-cyan-500' : 'text-gray-500'}`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-cyan-500/10 scale-110' : ''}`}>
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{t(item.label, language)}</span>
              </Link>
            );
          })}
          {currentUser?.isAdmin && (
             <Link 
               to="/admin" 
               className={`flex flex-col items-center justify-center gap-1 w-16 transition-all ${isActive(['/admin']) ? 'text-yellow-500' : 'text-gray-500'}`}
             >
               <div className={`p-1.5 rounded-xl transition-all ${isActive(['/admin']) ? 'bg-yellow-500/10 scale-110' : ''}`}>
                 <Shield size={22} strokeWidth={isActive(['/admin']) ? 2.5 : 2} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
             </Link>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 p-4 bg-cyan-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/40 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronUp size={24} />
        </button>
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12 md:pb-20">
        <Outlet />
      </main>
    </div>
  );
}
