import { useState } from 'react';
import { useAuth, useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import Icon from '../components/Icon';
import { Check, Plus, Image as ImageIcon, X, ChevronRight, Target, Clock, Trophy } from 'lucide-react';

export default function Quests() {
  const { quests, completeQuest, addQuest } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', category: 'sport', points: 50 });
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const categories = ['sport', 'education', 'earning', 'selfKnowledge', 'creativity'];

  const userQuests = quests.filter(q => !q.assignedTo || q.assignedTo.includes(currentUser?.id));

  const isCompleted = (quest) => {
    return quest.completed || quest.completions?.some(c => c.userId === currentUser?.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofImage(event.target?.result);
      setProofPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    if (selectedQuest && currentUser) {
      completeQuest(selectedQuest.id, currentUser.id, proofImage);
      setSelectedQuest(null);
      setProofImage(null);
      setProofPreview(null);
    }
  };

  const handleCreate = () => {
    if (newQuest.title && newQuest.description) {
      addQuest(newQuest.title, newQuest.description, newQuest.category, newQuest.points);
      setNewQuest({ title: '', description: '', category: 'sport', points: 50 });
      setShowCreateForm(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-end mb-12">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
        >
          <Plus size={20} />
          {t('common.createQuest', language)}
        </button>
      </div>

      {showCreateForm && (
        <div className={`mb-10 rounded-[2.5rem] border transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white/80 border-white shadow-blue-500/10'} backdrop-blur-xl p-8`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight uppercase">{t('common.createQuest', language)}</h2>
            <button onClick={() => setShowCreateForm(false)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}><X size={20} /></button>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.questTitle', language).toUpperCase()}</label>
                <input
                  type="text"
                  placeholder={t('common.questTitle', language)}
                  value={newQuest.title}
                  onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                  className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.reward', language).toUpperCase()}</label>
                <input
                  type="number"
                  value={newQuest.points}
                  onChange={(e) => setNewQuest({ ...newQuest, points: parseInt(e.target.value) })}
                  className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.questDescription', language).toUpperCase()}</label>
              <textarea
                placeholder={t('common.questDescription', language)}
                value={newQuest.description}
                onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                rows="3"
                className={`w-full p-4 rounded-2xl border font-medium text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewQuest({ ...newQuest, category: cat })}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${newQuest.category === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent'
                    : theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-500 shadow-sm'}`}
                >
                  {t(`common.${cat}`, language)}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
              <button onClick={handleCreate} className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest">{t('common.create', language)}</button>
              <button onClick={() => setShowCreateForm(false)} className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>{t('common.cancel', language).toUpperCase()}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {userQuests.map((quest) => {
          const completed = isCompleted(quest);
          return (
            <div key={quest.id} className={`rounded-[2.5rem] border transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-white shadow-xl shadow-blue-500/5 border-white'} backdrop-blur-xl p-8 group hover:-translate-y-1 ${completed ? 'grayscale opacity-60' : ''}`}>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${theme === 'dark' ? 'bg-gray-950/50 text-cyan-500 border border-white/5' : 'bg-cyan-50 text-cyan-600 border border-cyan-100'}`}>
                  <Icon name={quest.icon || 'Target'} size={32} strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-cyan-500 transition-colors">{quest.title}</h3>
                    <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-black tracking-widest shadow-lg shadow-blue-500/20`}>
                      +{quest.points} XP
                    </div>
                  </div>

                  <p className={`text-sm font-medium leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{quest.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-500/5 text-gray-500 border border-gray-500/10">
                      <Clock size={14} />
                      <span className="text-[10px] font-black tracking-widest uppercase">{new Date(quest.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] tracking-widest uppercase ${theme === 'dark' ? 'bg-purple-500/5 text-purple-400 border-purple-500/10' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                      <Target size={14} />
                      {t(`common.${quest.category}`, language)}
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase ml-auto ${completed 
                      ? 'bg-green-500/10 text-green-500 border-green-500/10' 
                      : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/10 animate-pulse'}`}>
                      {completed ? <Check size={14} /> : <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                      {completed ? t('common.questCompleted', language) : t('common.questActive', language)}
                    </div>
                  </div>

                  {!completed && (
                    <button
                      onClick={() => setSelectedQuest(quest)}
                      className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl hover:-translate-y-0.5 active:scale-98 transition-all uppercase tracking-widest"
                    >
                      {t('common.completeQuest', language)}
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedQuest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedQuest(null)}></div>
          <div className={`relative w-full max-w-lg rounded-[3rem] border p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="flex items-center justify-between mb-8 text-center sm:text-left">
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">{t('common.completeQuest', language)}</h3>
                <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">{selectedQuest.title}</p>
              </div>
              <button onClick={() => setSelectedQuest(null)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div className={`relative border-2 border-dashed rounded-[2.5rem] p-10 transition-all text-center group ${proofPreview ? 'border-cyan-500/50' : 'border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/5'}`}>
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {!proofPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-sm font-black tracking-widest uppercase text-gray-500 group-hover:text-cyan-500">{t('common.uploadProof', language)}</p>
                    </div>
                  ) : (
                    <div className="relative group/img overflow-hidden rounded-[2rem] shadow-xl">
                      <img src={proofPreview} alt="Proof" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-black text-xs tracking-widest uppercase">{t('common.changePhoto', language)}</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleComplete}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest"
                >
                  <Trophy size={18} />
                  {t('common.submitQuest', language).toUpperCase()}
                </button>
                <button onClick={() => { setSelectedQuest(null); setProofPreview(null); setProofImage(null); }} className={`px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>{t('common.cancel', language)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
