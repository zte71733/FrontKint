import { useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-10 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-10 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
      </div>

      <div className="relative z-10">
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
          <AlertCircle size={48} />
        </div>
        
        <h1 className="text-8xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-500 to-gray-700 opacity-20">404</h1>
        
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          {language === 'ru' ? 'Страница не найдена' : language === 'zh' ? '页面未找到' : 'Page Not Found'}
        </h2>
        
        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
          {language === 'ru' ? 'Похоже, вы забрели не туда. Этой страницы больше не существует или адрес был введен неверно.' : 'The page you are looking for doesn\'t exist or has been moved.'}
        </p>

        <button 
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
          {t('common.backToFeed', language)}
        </button>
      </div>
    </div>
  );
}
