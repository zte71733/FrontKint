import { useState } from 'react';
import { useData, useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Type, AlignLeft, Palette, Check } from 'lucide-react';

export default function CreateClan() {
  const { createClan } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinMethod, setJoinMethod] = useState('open'); // 'open', 'approval', 'password'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const colors = [
    'from-cyan-500 to-blue-600', 
    'from-purple-500 to-indigo-600', 
    'from-green-500 to-emerald-600', 
    'from-pink-500 to-rose-600', 
    'from-amber-500 to-orange-600'
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleCreate = async () => {
    if (!clanName.trim() || !clanDescription.trim()) {
      setError(t('auth.fillAllFields', language));
      return;
    }
    if (joinMethod === 'password' && !password.trim()) {
      setError(language === 'ru' ? 'Введите пароль для клана' : 'Please enter clan password');
      return;
    }
    setError('');
    try {
      await createClan(currentUser.id, clanName, clanDescription, selectedColor, { isPrivate, joinMethod, password });
      setSuccess(true);
      setTimeout(() => navigate('/clans'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to create clan');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <button onClick={() => navigate('/clans')} className="flex items-center gap-2 text-cyan-500 hover:text-blue-500 mb-8 font-black tracking-widest uppercase text-xs transition-colors">
        <ArrowLeft size={14} />
        {t('common.backToClans', language)}
      </button>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t('common.createClan', language)}</h1>
        <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto md:mx-0"></div>
      </div>

      {error && (
        <div className={`p-4 rounded-2xl mb-6 border animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'} text-sm font-bold`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`p-4 rounded-2xl mb-6 border animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-100 text-green-600'} text-sm font-bold flex items-center gap-2`}>
          <Check size={18} />
          {t('common.clanCreated', language)}
        </div>
      )}

      <div className={`rounded-[3rem] border transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white/80 border-white shadow-xl shadow-blue-500/5'} backdrop-blur-xl p-8 md:p-10`}>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 ml-4">
              <Type size={14} />
              <label className="text-[10px] font-black uppercase tracking-widest">{t('common.name', language)}</label>
            </div>
            <input
              type="text"
              name="clanName"
              placeholder={language === 'ru' ? 'Введите название...' : 'Enter a powerful name...'}
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              className={`w-full p-5 rounded-3xl border font-black text-lg outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 ml-4">
              <AlignLeft size={14} />
              <label className="text-[10px] font-black uppercase tracking-widest">{t('common.description', language)}</label>
            </div>
            <textarea
              name="clanDescription"
              placeholder={language === 'ru' ? 'Опишите ваш клан...' : "What is your clan's mission?"}
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              rows="4"
              className={`w-full p-5 rounded-3xl border font-medium text-sm outline-none transition-all resize-none ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
            />
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-500/5 border border-white/5">
                <div>
                   <h4 className="font-black text-sm uppercase tracking-widest mb-1">{language === 'ru' ? 'Приватный клан' : 'Private Clan'}</h4>
                   <p className="text-[10px] font-bold text-gray-500 uppercase">{isPrivate ? (language === 'ru' ? 'Требуется проверка' : 'Requires verification') : (language === 'ru' ? 'Открыто для всех' : 'Open for everyone')}</p>
                </div>
                <button 
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isPrivate ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${isPrivate ? 'right-1' : 'left-1'}`} />
                </button>
             </div>

             {isPrivate && (
               <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-2 p-1 bg-gray-500/5 rounded-2xl border border-white/5">
                    {[
                      { id: 'approval', label: language === 'ru' ? 'Одобрение' : 'Approval' },
                      { id: 'password', label: language === 'ru' ? 'Пароль' : 'Password' }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setJoinMethod(opt.id)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${joinMethod === opt.id ? 'bg-white dark:bg-gray-800 shadow-md text-cyan-500' : 'text-gray-500'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {joinMethod === 'password' && (
                    <input
                      type="password"
                      placeholder={language === 'ru' ? 'Установите пароль клана' : 'Set clan password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full p-5 rounded-3xl border font-black text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
                    />
                  )}
               </div>
             )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-500 ml-4">
              <Palette size={14} />
              <label className="text-[10px] font-black uppercase tracking-widest">{t('common.colorTheme', language)}</label>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-14 h-14 bg-gradient-to-r ${color} rounded-2xl transition-all duration-300 relative group ${selectedColor === color ? 'scale-110 shadow-lg ring-4 ring-white dark:ring-gray-800' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Check size={24} strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreate}
              className="flex-1 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <Flag size={22} />
              {t('common.createClan', language)}
            </button>
            <button
              onClick={() => navigate('/clans')}
              className={`px-10 py-5 rounded-[2rem] font-black text-sm transition-all uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {t('common.cancel', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
