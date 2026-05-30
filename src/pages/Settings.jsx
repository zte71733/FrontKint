import { useState } from 'react';
import { useAuth, useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Trash2, Moon, Sun, AlertTriangle, Download, Key, CheckCircle2, X, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { theme, toggle } = useTheme();
  const { language } = useLanguage();
  const { logout, currentUser, updateCurrentUser } = useAuth();
  const { resetAllData, posts, achievements } = useData();
  const navigate = useNavigate();
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordChange] = useState({ old: '', new: '', confirm: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleReset = () => {
    if (window.confirm(t('settings.confirmReset', language))) {
      resetAllData();
      window.location.href = '/landing';
    }
  };

  const handlePrivacyToggle = () => {
    updateCurrentUser({ isPrivate: !currentUser?.isPrivate });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordForm.old !== currentUser?.password) {
      setError(t('common.incorrectPassword', language));
      return;
    }
    if (passwordForm.new.length < 6) {
      setError(t('common.passwordTooShort', language));
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setError(t('auth.passwordsNotMatch', language));
      return;
    }

    updateCurrentUser({ password: passwordForm.new });
    setSuccess(t('common.passwordChanged', language));
    setPasswordChange({ old: '', new: '', confirm: '' });
    setTimeout(() => setSuccess(''), 3000);
  };

  const exportData = () => {
    const userData = {
      profile: currentUser,
      posts: posts.filter(p => p.authorId === currentUser.id),
      achievements: achievements.filter(a => (currentUser.unlockedAchievements || []).includes(a.id)),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kint-data-${currentUser.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (window.confirm(t('common.confirmDeleteAccount', language))) {
      if (window.confirm(t('common.typeDeleteToConfirm', language))) {
        logout();
        navigate('/landing');
      }
    }
  };

  const sectionClass = `rounded-[2.5rem] border p-8 transition-all duration-500 backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-white/80 border-white shadow-xl shadow-blue-500/5'}`;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t('nav.settings', language)}</h1>
        <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto md:mx-0"></div>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6 text-green-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold uppercase tracking-tight">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 text-red-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={20} />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            {theme === 'dark' ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-orange-500" />}
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-500">{t('common.colorTheme', language)}</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold">{t('common.darkMode', language)}</span>
            <button onClick={toggle} className={`w-14 h-8 rounded-full transition-all relative p-1 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-200 shadow-inner'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className={sectionClass}>
          <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="w-full flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Key size={20} className="text-yellow-500" />
               <h2 className="text-sm font-black tracking-widest uppercase text-gray-500">{t('common.security', language)}</h2>
             </div>
             {showPasswordChange ? <X size={18} /> : <ChevronRight size={18} />}
          </button>
          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
               <input type="password" placeholder={t('common.currentPassword', language)} value={passwordForm.old} onChange={e => setPasswordChange({...passwordForm, old: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
               <input type="password" placeholder={t('common.newPassword', language)} value={passwordForm.new} onChange={e => setPasswordChange({...passwordForm, new: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold ${theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
               <input type="password" placeholder={t('common.confirmNewPassword', language)} value={passwordForm.confirm} onChange={e => setPasswordChange({...passwordForm, confirm: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold ${theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
               <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">{t('common.updatePassword', language)}</button>
            </form>
          )}
        </div>

        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-green-500" />
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-500">PRIVACY</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gray-400" />
                <span className="font-bold">{t('common.publicProfile', language)}</span>
              </div>
              <button onClick={handlePrivacyToggle} className={`w-12 h-7 rounded-full transition-all relative p-1 ${currentUser?.isPrivate === false ? 'bg-green-500' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${currentUser?.isPrivate === false ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">{t('common.commentPermission', language)}</label>
              <div className="flex gap-2 p-1 bg-gray-500/5 rounded-xl border border-white/5">
                {['everyone', 'friends', 'nobody'].map(opt => (
                  <button key={opt} onClick={() => updateCurrentUser({ privacy: { ...(currentUser?.privacy || {}), commentPermission: opt } })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${currentUser?.privacy?.commentPermission === opt || (!currentUser?.privacy?.commentPermission && opt === 'everyone') ? 'bg-white dark:bg-gray-800 shadow-sm text-cyan-500' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t(`common.${opt}`, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <Download size={20} className="text-cyan-500" />
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-500">{t('common.dataManagement', language)}</h2>
          </div>
          <button onClick={exportData} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-gray-300' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
            <Download size={16} /> {t('common.exportData', language)}
          </button>
        </div>

        <div className="pt-10 space-y-4">
          <button onClick={() => { logout(); navigate('/landing'); }} className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-98 transition-all">
            {t('common.logout', language).toUpperCase()}
          </button>
          <div className="flex gap-4">
             <button onClick={handleReset} className="flex-1 py-5 border-2 border-red-500/20 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
               <AlertTriangle size={16} /> {t('common.resetData', language).toUpperCase()}
             </button>
             <button onClick={deleteAccount} className="flex-1 py-5 border-2 border-red-500/20 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
               <Trash2 size={16} /> {t('common.deleteAccount', language).toUpperCase()}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
