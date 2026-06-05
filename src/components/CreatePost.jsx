import { useState, useRef } from 'react';
import { useData, useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import Avatar from './Avatar';
import { Image as ImageIcon, X, Send, Loader2 } from 'lucide-react';

export default function CreatePost() {
  const { addPost, users } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('sport');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const user = users.find(u => u.id === currentUser?.id);
  const categories = ['sport', 'education', 'earning', 'selfKnowledge', 'creativity'];
  const maxChars = 2000;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'ru' ? 'Разрешены только изображения' : 'Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'ru' ? 'Файл слишком большой (макс. 5МБ)' : 'File too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if ((!title && !image) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addPost(currentUser.id, title, description, category, image);
      setTitle('');
      setDescription('');
      setImage(null);
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title || description || image) {
      if (window.confirm(t('common.confirmDiscard', language))) {
        resetForm();
      }
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
    setIsExpanded(false);
  };

  return (
    <div className={`mb-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white border-white shadow-xl shadow-blue-500/5'} backdrop-blur-xl`}>
      <div className="p-6 md:p-8">
        <div className="flex gap-4">
          <Avatar user={user} size="md" className="rounded-2xl border-2 border-cyan-500/10" />
          
          <div className="flex-1 space-y-4">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className={`w-full text-left p-4 rounded-2xl border transition-all font-medium text-sm ${theme === 'dark' ? 'bg-gray-950/40 border-white/5 text-gray-400 hover:border-cyan-500/30' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-cyan-200'}`}
              >
                {t('common.whatDidYouAccomplish', language)}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500">{t('common.postAchievement', language)}</h3>
                  <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-500/10 text-gray-500 transition-colors"><X size={18} /></button>
                </div>

                <input
                  type="text"
                  placeholder={t('common.titleOfYourAchievement', language)}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-4 rounded-2xl border font-black text-lg outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
                />

                <div className="relative">
                  <textarea
                    placeholder={t('common.describeWhatYouDid', language)}
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
                    rows="4"
                    className={`w-full p-4 rounded-2xl border font-medium text-sm outline-none transition-all resize-none ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
                  />
                  <div className={`absolute bottom-3 right-4 text-[9px] font-black uppercase tracking-widest ${description.length >= maxChars ? 'text-red-500' : 'text-gray-400'}`}>
                    {description.length} / {maxChars} {t('common.charCount', language)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat 
                        ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                        : theme === 'dark' ? 'bg-gray-800 border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                    >
                      {t(`common.${cat}`, language)}
                    </button>
                  ))}
                </div>

                {image && (
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                    <img src={image} alt="Preview" className="w-full h-64 object-cover" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t dark:border-white/5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <ImageIcon size={18} className="text-cyan-500" />
                    {t('common.uploadImage', language)}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={(!title && !image) || isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin text-white/50" /> : <Send size={16} />}
                    {t('common.post', language)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
