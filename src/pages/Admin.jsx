import { useState } from 'react';
import { useData, useTheme, useLanguage, useAuth } from '../context/Contexts';
import { getAchievementText } from '../mockData';
import { t } from '../i18n/translations';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { Medal, X, Trash2, ShieldAlert, ShieldCheck, LayoutDashboard, Users, MessageSquare, Target, Trophy, Flag, Edit3, Save, Ban, Plus, Crown, Shield, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function Admin() {
  const { 
    users, posts, quests, achievements, clans, 
    deleteUser, addQuest, updateQuest, removeQuestFromAll, 
    addAchievement, deleteAchievement, deleteClan,
    unlockUserAchievement, lockUserAchievement, banUser, unbanUser, toggleAdmin,
    cancelQuestCompletion 
  } = useData();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newQuest, setNewQuest] = useState({ title: '', description: '', category: 'sport', points: 50, assignedTo: [] });
  const [assignMode, setAssignMode] = useState('all'); // 'all' or 'specific'
  const [newAchievement, setNewAchievement] = useState({
    nameEn: '', nameRu: '', nameZh: '',
    descEn: '', descRu: '', descZh: '',
    category: 'creativity', type: 'milestone', target: 1, icon: 'Medal'
  });
  const [editingQuest, setEditingQuest] = useState(null);
  const [managingQuest, setManagingQuest] = useState(null);
  const [managingUser, setManagingUser] = useState(null);
  const [viewingProof, setViewingProof] = useState(null); // { questId, completion }

  const categories = ['sport', 'education', 'earning', 'selfKnowledge', 'creativity'];

  const handleUpdateQuest = () => {
    if (editingQuest) {
      updateQuest(editingQuest.id, editingQuest);
      setEditingQuest(null);
    }
  };

  const handleAddQuest = () => {
    if (newQuest.title && newQuest.description) {
      const assignedTo = assignMode === 'all' ? null : newQuest.assignedTo;
      addQuest(newQuest.title, newQuest.description, newQuest.category, newQuest.points, assignedTo);
      setNewQuest({ title: '', description: '', category: 'sport', points: 50, assignedTo: [] });
      setAssignMode('all');
    }
  };

  const toggleUserAssignment = (userId) => {
    setNewQuest(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleAddAchievement = () => {
    if (newAchievement.nameEn && newAchievement.descEn) {
      addAchievement(
        { en: newAchievement.nameEn, ru: newAchievement.nameRu || newAchievement.nameEn, zh: newAchievement.nameZh || newAchievement.nameEn },
        { en: newAchievement.descEn, ru: newAchievement.descRu || newAchievement.descEn, zh: newAchievement.descZh || newAchievement.descEn },
        newAchievement.category,
        newAchievement.type,
        newAchievement.target
      );
      setNewAchievement({
        nameEn: '', nameRu: '', nameZh: '',
        descEn: '', descRu: '', descZh: '',
        category: 'creativity', type: 'milestone', target: 1, icon: 'Medal'
      });
    }
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return t('common.never', language);
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000 * 60 * 5) return <span className="text-green-500 font-black animate-pulse">{t('common.online', language).toUpperCase()}</span>;
    
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    const diffMins = Math.floor(diff / (1000 * 60));
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    return rtf.format(-Math.floor(diffHours / 24), 'day');
  };

  const stats = [
    { label: t('admin.totalUsers', language), value: users.length, icon: Users, color: 'blue' },
    { label: t('admin.totalPosts', language), value: posts.length, icon: MessageSquare, color: 'cyan' },
    { label: t('admin.totalQuests', language), value: quests.length, icon: Target, color: 'purple' },
    { label: t('admin.totalAchievements', language), value: achievements.length, icon: Trophy, color: 'orange' }
  ];

  const tabs = [
    { id: 'dashboard', label: t('admin.dashboard', language), icon: LayoutDashboard },
    { id: 'users', label: t('admin.users', language), icon: Users },
    { id: 'quests', label: t('admin.quests', language), icon: Target },
    { id: 'achievements', label: t('admin.achievements', language), icon: Trophy },
    { id: 'clans', label: t('admin.clans', language), icon: Shield }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t('admin.adminPanel', language)}</h1>
        <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto md:mx-0"></div>
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {tabs.map((tab) => {
          const ActiveIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-xs tracking-widest uppercase whitespace-nowrap border ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20' 
                : theme === 'dark' ? 'bg-gray-900 border-white/10 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}`}
            >
              <ActiveIcon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className={`p-8 rounded-[3rem] border shadow-sm group hover:shadow-xl transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-white'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-${stat.color}-500/10 text-${stat.color}-500`}>
                  <stat.icon size={28} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className={`rounded-[3rem] border overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-50'}`}>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">{t('admin.users', language)}</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">LEVEL / XP</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">{t('admin.lastOnline', language)}</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">ROLE</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">{t('admin.actions', language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar user={user} size="md" />
                            {user.isAdmin && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full shadow-sm">
                                <Crown size={10} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">{user.name}</p>
                            <p className="text-xs font-bold text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-cyan-500">LVL {user.level}</span>
                          <span className="text-[10px] font-bold text-gray-500">{user.points} XP</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {formatLastSeen(user.lastSeen)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isAdmin ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setManagingUser(user.id)} title={t('admin.manageAchievements', language)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'}`}>
                            <Medal size={18} />
                          </button>
                          <button onClick={() => toggleAdmin(user.id)} title="Toggle Admin" className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                            {user.isAdmin ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                          </button>
                          {user.id !== currentUser?.id && (
                            <>
                              <button onClick={() => user.banned ? unbanUser(user.id) : banUser(user.id)} title={user.banned ? "Unban" : "Ban"} className={`p-2 rounded-xl transition-all ${user.banned ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                                <Ban size={18} />
                              </button>
                              <button onClick={() => deleteUser(user.id)} title={t('admin.delete', language)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-10">
            <div className={`p-10 rounded-[3rem] border shadow-sm ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">{t('admin.create', language)} {t('admin.quests', language)}</h3>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border dark:border-white/5">
                  <button onClick={() => setAssignMode('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${assignMode === 'all' ? 'bg-white dark:bg-gray-800 shadow-sm text-cyan-500' : 'text-gray-500'}`}>{t('admin.allUsers', language)}</button>
                  <button onClick={() => setAssignMode('specific')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${assignMode === 'specific' ? 'bg-white dark:bg-gray-800 shadow-sm text-cyan-500' : 'text-gray-500'}`}>{t('admin.specificUsers', language)}</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.name', language)}</label>
                  <input type="text" value={newQuest.title} onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} placeholder={t('common.questTitle', language)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.category', language)}</label>
                  <select value={newQuest.category} onChange={(e) => setNewQuest({...newQuest, category: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}>
                    {categories.map(cat => <option key={cat} value={cat}>{t(`common.${cat}`, language)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.reward', language).toUpperCase()} XP</label>
                  <input type="number" value={newQuest.points} onChange={(e) => setNewQuest({...newQuest, points: parseInt(e.target.value)})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.description', language)}</label>
                  <textarea value={newQuest.description} onChange={(e) => setNewQuest({...newQuest, description: e.target.value})} className={`w-full p-4 rounded-2xl border font-medium text-sm outline-none transition-all min-h-[120px] ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} placeholder={t('common.questDescription', language)} />
                </div>
                
                {assignMode === 'specific' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.assignToUsers', language)}</label>
                    <div className={`w-full p-4 rounded-2xl border min-h-[120px] max-h-[120px] overflow-y-auto no-scrollbar ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {users.map(user => (
                          <button 
                            key={user.id} 
                            onClick={() => toggleUserAssignment(user.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${newQuest.assignedTo.includes(user.id) ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500' : 'border-transparent text-gray-500 hover:bg-gray-500/5'}`}
                          >
                            <Avatar user={user} size="xs" />
                            <span className="text-xs font-bold truncate">{user.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button onClick={handleAddQuest} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 uppercase tracking-widest">
                  {t('admin.addQuest', language)} {assignMode === 'specific' ? `(${newQuest.assignedTo.length})` : ''}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest) => (
                <div key={quest.id} className={`p-8 rounded-[3rem] border group transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-white'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Flag size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {t(`common.${quest.category}`, language)}
                      </span>
                      {quest.assignedTo && (
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-tighter bg-purple-500/10 px-2 py-0.5 rounded-full">{t('admin.targeted', language)}</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight mb-2 truncate">{quest.title}</h4>
                  <p className="text-xs font-bold text-gray-500 line-clamp-2 mb-6 h-8">{quest.description}</p>
                  
                  {(quest.completions || []).length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-gray-500/5 border border-dashed border-gray-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{t('admin.recentProofs', language)}</p>
                      <div className="flex flex-wrap gap-2">
                        {quest.completions.map((comp, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setViewingProof({ questId: quest.id, completion: comp })}
                            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-500/20 hover:border-cyan-500 transition-all group/proof relative"
                          >
                            {comp.photoUrl ? (
                              <img src={comp.photoUrl} alt="Proof" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center"><Eye size={14} /></div>
                            )}
                            <div className="absolute inset-0 bg-cyan-500/40 opacity-0 group-hover/proof:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye size={14} /></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-500">{quest.points} XP</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingQuest(quest)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => setManagingQuest(managingQuest === quest.id ? null : quest.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                        <Users size={18} />
                      </button>
                      <button onClick={() => removeQuestFromAll(quest.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-10">
            <div className={`p-10 rounded-[3rem] border shadow-sm ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Trophy size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight uppercase">{t('admin.create', language)} {t('admin.achievements', language)}</h3>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-500 border-b border-cyan-500/20 pb-2">English (Required)</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">NAME</label>
                      <input type="text" value={newAchievement.nameEn} onChange={(e) => setNewAchievement({ ...newAchievement, nameEn: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">DESCRIPTION</label>
                      <input type="text" value={newAchievement.descEn} onChange={(e) => setNewAchievement({ ...newAchievement, descEn: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Русский / 中文 (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">NAME (RU)</label>
                        <input type="text" value={newAchievement.nameRu} onChange={(e) => setNewAchievement({ ...newAchievement, nameRu: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">NAME (ZH)</label>
                        <input type="text" value={newAchievement.nameZh} onChange={(e) => setNewAchievement({ ...newAchievement, nameZh: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.category', language).toUpperCase()}</label>
                    <select value={newAchievement.category} onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}>
                      {categories.map(cat => <option key={cat} value={cat}>{t(`common.${cat}`, language)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">TYPE</label>
                    <select value={newAchievement.type} onChange={(e) => setNewAchievement({ ...newAchievement, type: e.target.value })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}>
                      <option value="milestone">Milestone</option>
                      <option value="points">Points</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.target', language).toUpperCase()}</label>
                    <input type="number" value={newAchievement.target} onChange={(e) => setNewAchievement({ ...newAchievement, target: parseInt(e.target.value) })} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
                  </div>
                  <button onClick={handleAddAchievement} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-orange-500/20 uppercase tracking-widest">
                    {t('admin.addAchievement', language)}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-8 rounded-[3rem] border group transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-white'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <Icon name={achievement.icon || 'Medal'} size={24} />
                    </div>
                    <button onClick={() => deleteAchievement(achievement.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-500 hover:text-red-400' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight mb-2 truncate">{getAchievementText(achievement, 'name', language)}</h4>
                  <p className="text-xs font-bold text-gray-500 line-clamp-2 mb-6 h-8">{getAchievementText(achievement, 'description', language)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{achievement.type} • {achievement.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map((clan) => (
              <div key={clan.id} className={`p-8 rounded-[3rem] border group transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-white'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${clan.color || 'from-gray-500 to-gray-700'} shadow-lg flex items-center justify-center text-white`}>
                    <Shield size={28} />
                  </div>
                  <button onClick={() => deleteClan(clan.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-500 hover:text-red-400' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4 className="font-black text-lg uppercase tracking-tight mb-2 truncate">{clan.name}</h4>
                <p className="text-xs font-bold text-gray-500 line-clamp-2 mb-6 h-8">{clan.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-500">{clan.members || 0} {t('common.members', language).toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-gray-500">{clan.points || 0} TOTAL XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingQuest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setEditingQuest(null)}></div>
          <div className={`relative w-full max-w-lg rounded-[3rem] border p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight uppercase">{t('admin.editQuest', language)}</h3>
              <button onClick={() => setEditingQuest(null)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.name', language).toUpperCase()}</label>
                <input type="text" value={editingQuest.title} onChange={(e) => setEditingQuest({...editingQuest, title: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('admin.category', language).toUpperCase()}</label>
                <select value={editingQuest.category} onChange={(e) => setEditingQuest({...editingQuest, category: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`}>
                  {categories.map(cat => <option key={cat} value={cat}>{t(`common.${cat}`, language)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('common.reward', language).toUpperCase()} XP</label>
                <input type="number" value={editingQuest.points} onChange={(e) => setEditingQuest({...editingQuest, points: parseInt(e.target.value)})} className={`w-full p-4 rounded-2xl border font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50'}`} />
              </div>
              <button onClick={handleUpdateQuest} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 uppercase tracking-widest">
                <Save size={18} /> {t('admin.saveChanges', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {managingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setManagingUser(null)}></div>
          <div className={`relative w-full max-w-2xl rounded-[3rem] border p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">{t('admin.manageAchievements', language)}</h3>
                <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">{users.find(u => u.id === managingUser)?.name}</p>
              </div>
              <button onClick={() => setManagingUser(null)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar p-1">
              {achievements.map((achievement) => {
                const user = users.find(u => u.id === managingUser);
                const isUnlocked = (user?.unlockedAchievements || []).includes(achievement.id);
                return (
                  <button
                    key={achievement.id}
                    onClick={() => isUnlocked ? lockUserAchievement(managingUser, achievement.id) : unlockUserAchievement(managingUser, achievement.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group ${isUnlocked
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : theme === 'dark' ? 'border-white/5 bg-gray-950/40 opacity-40 hover:opacity-100' : 'border-gray-100 bg-gray-50/50 opacity-40 hover:opacity-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isUnlocked ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 scale-110' : 'bg-gray-800 text-gray-500'}`}>
                      <Trophy size={24} fill={isUnlocked ? "currentColor" : "none"} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-black uppercase tracking-tight truncate ${isUnlocked ? 'text-cyan-500' : ''}`}>{getAchievementText(achievement, 'name', language)}</p>
                      <p className="text-[10px] font-bold text-gray-500 truncate">{getAchievementText(achievement, 'description', language)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewingProof && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setViewingProof(null)}></div>
          <div className={`relative w-full max-w-xl rounded-[3rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Avatar user={users.find(u => u.id === viewingProof.completion.userId)} size="md" />
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">{t('admin.questProof', language)}</h3>
                    <p className="text-xs font-black text-cyan-500 uppercase tracking-widest">{users.find(u => u.id === viewingProof.completion.userId)?.name}</p>
                  </div>
                </div>
                <button onClick={() => setViewingProof(null)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={24} /></button>
              </div>
              
              {viewingProof.completion.photoUrl ? (
                <img src={viewingProof.completion.photoUrl} alt="Proof" className="w-full h-80 object-cover rounded-3xl mb-8 shadow-inner" />
              ) : (
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-950 rounded-3xl flex items-center justify-center mb-8 border border-dashed dark:border-white/10">
                  <p className="font-bold text-gray-500 uppercase tracking-widest">{t('common.noPhotoProvided', language)}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    cancelQuestCompletion(viewingProof.questId, viewingProof.completion.userId);
                    setViewingProof(null);
                  }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-500/20 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <XCircle size={20} /> {t('admin.rejectProof', language)}
                </button>
                <button 
                  onClick={() => setViewingProof(null)}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <CheckCircle size={20} /> {t('admin.approve', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
