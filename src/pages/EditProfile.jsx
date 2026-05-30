import { useState, useEffect } from 'react';
import { useAuth, useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { ArrowLeft, Camera, Image as ImageIcon, Save, RotateCw, AlertTriangle, Crop, Check, X } from 'lucide-react';

export default function EditProfile() {
  const { users, setUsers } = useData();
  const { currentUser, updateCurrentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const user = users.find(u => u.id === currentUser?.id);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [cropModal, setCropModal] = useState(null); // { img, type: 'avatar' | 'banner' }

  useEffect(() => {
    if (user && !isInitialized) {
      Promise.resolve().then(() => {
        setName(user.name || '');
        setBio(user.bio || '');
        setAvatarPreview(user.avatar || '');
        setBannerPreview(user.banner || '');
        setIsPrivate(user.isPrivate || false);
        setIsInitialized(true);
      });
    }
  }, [user, isInitialized]);

  const rotateImage = (base64, previewSetter) => {
    if (!base64) return;
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      previewSetter(canvas.toDataURL('image/jpeg', 0.8));
    };
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(language === 'ru' ? 'Только изображения разрешены к загрузке' : 'Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'ru' ? 'Файл слишком большой (макс. 5МБ)' : 'File too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropModal({ img: event.target?.result, type });
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    if (cropModal.type === 'avatar') setAvatarPreview(cropModal.img);
    else setBannerPreview(cropModal.img);
    setCropModal(null);
  };

  const handleSave = () => {
    if (!user) return;
    const updates = { name, bio, avatar: avatarPreview, banner: bannerPreview, isPrivate };
    setUsers(users.map(u => u.id === user.id ? { ...u, ...updates } : u));
    updateCurrentUser(updates);
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-cyan-500 hover:text-blue-500 mb-8 font-black tracking-widest uppercase text-xs transition-colors">
        <ArrowLeft size={14} />
        {t('common.backToFeed', language)}
      </button>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 text-red-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className={`rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white shadow-xl shadow-blue-500/5 border-white'} backdrop-blur-xl`}>
        {/* Banner Editor */}
        <div className="h-40 md:h-48 relative group overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400">
          {bannerPreview && <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3">
            <label className="cursor-pointer p-3 md:p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white font-black text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all">
              <ImageIcon size={18} />
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" />
              {t('common.uploadBanner', language)}
            </label>
            {bannerPreview && (
              <button onClick={() => rotateImage(bannerPreview, setBannerPreview)} className="p-3 md:p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:scale-105 transition-all">
                <RotateCw size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 md:px-8 pb-10">
          <div className="flex items-center gap-8 -mt-10 md:-mt-12 mb-10 relative z-10">
            <div className="relative group">
              <Avatar src={avatarPreview} alt="Avatar" size={100} className={`rounded-full border-4 ${theme === 'dark' ? 'border-gray-900' : 'border-white'} shadow-2xl bg-white dark:bg-gray-800 transition-all`} />
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <label className="cursor-pointer p-2.5 bg-cyan-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                  <Camera size={20} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} className="hidden" />
                </label>
                {avatarPreview && (
                  <button onClick={() => rotateImage(avatarPreview, setAvatarPreview)} className="p-2.5 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                    <RotateCw size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.nickname', language)}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl border font-black text-base md:text-lg outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.bio', language)}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl border font-medium text-sm outline-none transition-all resize-none ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
              />
            </div>

            <div className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
               <div>
                 <h4 className="text-sm font-black uppercase tracking-widest mb-1">{t('common.publicProfile', language)}</h4>
                 <p className="text-[10px] font-bold text-gray-500 uppercase">{isPrivate ? t('common.restrictedAccess', language) : t('common.everyone', language)}</p>
               </div>
               <button 
                 onClick={() => setIsPrivate(!isPrivate)}
                 className={`w-14 h-8 rounded-full transition-all relative ${!isPrivate ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-700'}`}
               >
                 <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${!isPrivate ? 'right-1' : 'left-1'}`} />
               </button>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                className="flex-1 py-4 md:py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-base md:text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Save size={22} />
                {t('common.saveChanges', language)}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm transition-all uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {t('common.cancel', language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal Simulator */}
      {cropModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-lg"></div>
          <div className={`relative w-full max-w-lg rounded-[3rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight">Adjust Image</h3>
                <button onClick={() => setCropModal(null)} className="p-2 rounded-xl hover:bg-gray-500/10"><X size={24} /></button>
              </div>
              
              <div className="relative aspect-square md:aspect-video mb-8 bg-gray-100 dark:bg-gray-950 rounded-3xl overflow-hidden flex items-center justify-center border border-dashed dark:border-white/10 group">
                <img src={cropModal.img} alt="To crop" className="max-w-full max-h-full object-contain" />
                <div className={`absolute inset-0 pointer-events-none border-[60px] border-black/60 ${cropModal.type === 'avatar' ? 'rounded-full' : ''}`}></div>
                <div className="absolute top-4 left-4 p-3 bg-black/50 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Crop size={14} /> {cropModal.type} Preview
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setCropModal(null)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900">Cancel</button>
                <button onClick={applyCrop} className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                  <Check size={18} /> Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
