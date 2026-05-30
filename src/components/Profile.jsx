import { useAuth, useData, useTheme, useLanguage } from '../context/Contexts';
import { getAchievementText } from '../mockData';
import { t } from '../i18n/translations';
import RadarChart from './RadarChart';
import Avatar from './Avatar';
import { Link } from 'react-router-dom';
import { Edit3, Award, Trophy, ChevronRight, Plus } from 'lucide-react';
import bannerLight from '../assets/banner-light.png';
import bannerDark from '../assets/banner-dark.png';

export default function Profile() {
  const { users = [], quests = [], achievements = [], clans = [], joinedClans = [], calculateLevel, getXpNeeded, getCurrentLevelProgress } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const user = (users || []).find(u => u.id === currentUser?.id);
  const myClans = (clans || []).filter(c => Array.isArray(joinedClans) && joinedClans.includes(c.id));

  if (!user) return null;

  const calculateCategoryProgress = (category) => {
    const categoryQuests = quests.filter(q => q.category === category);
    if (categoryQuests.length === 0) return 0;
    const completedQuests = categoryQuests.filter(q => q.completed || q.completions?.some(c => c.userId === user.id)).length;
    return Math.round((completedQuests / categoryQuests.length) * 100);
  };

  const radarData = [
    calculateCategoryProgress('sport'),
    calculateCategoryProgress('education'),
    calculateCategoryProgress('earning'),
    calculateCategoryProgress('selfKnowledge'),
    calculateCategoryProgress('creativity')
  ];

  return (
    <div className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white/80 border-white shadow-blue-500/10'} backdrop-blur-xl`}>
      {/* Banner */}
      <div className="h-32 relative overflow-hidden">
        <img 
          src={user.banner || (theme === 'dark' ? bannerDark : bannerLight)} 
          alt="Banner" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
      </div>

      <div className="px-8 pb-8 relative">
        {/* Header Section */}
        <div className="flex justify-between items-end -mt-12 mb-6 relative z-10">
          <Avatar src={user.avatar} alt={user.name} size={100} className={`rounded-full border-4 ${theme === 'dark' ? 'border-gray-900' : 'border-white'} shadow-xl bg-white dark:bg-gray-800`} />
          <Link
            to="/edit-profile"
            className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:text-white' : 'bg-white text-gray-600 hover:text-gray-900 shadow-md border border-gray-100'}`}
            title={t('common.editProfile', language)}
          >
            <Edit3 size={20} />
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1">{user.name}</h1>
          <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.bio}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'common.followers', value: user.followers || 0, color: 'text-cyan-500' },
            { label: 'common.following', value: user.following || 0, color: 'text-blue-500' },
            { label: 'common.points', value: user.points || 0, color: 'text-purple-500' }
          ].map(stat => (
            <div key={stat.label} className={`p-4 rounded-3xl border text-center transition-colors ${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t(stat.label, language)}</p>
            </div>
          ))}
        </div>

        {/* Level Box */}
        <div className={`p-6 rounded-[2rem] border mb-8 ${theme === 'dark' ? 'bg-gray-950/40 border-white/5' : 'bg-white shadow-sm border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                {calculateLevel(user.points)}
              </div>
              <div>
                <p className="font-black text-xs tracking-widest uppercase">{t('common.level', language)}</p>
                <p className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{user.points} TOTAL XP</p>
              </div>
            </div>
            <span className={`text-[10px] font-black tracking-widest text-right ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              NEXT: {getXpNeeded(user.points)} XP
            </span>
          </div>
          <div className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-full h-3 overflow-hidden p-0.5 border dark:border-white/5`}>
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${getCurrentLevelProgress(user.points)}%` }}
            ></div>
          </div>
        </div>

        {/* Radar Chart Section */}
        <div className={`p-6 rounded-[2.5rem] border mb-8 ${theme === 'dark' ? 'bg-gray-950/40 border-white/5' : 'bg-white shadow-sm border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Award size={16} className="text-cyan-500" />
            <h3 className="font-black text-xs tracking-widest uppercase">{t('common.progressByCategory', language)}</h3>
          </div>
          <div className="flex justify-center py-4">
            <RadarChart data={radarData} size={240} />
          </div>
        </div>

        {/* Clans Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xs tracking-widest uppercase">{t('nav.clans', language)}</h3>
            <Link to="/clans" className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-cyan-600 transition-colors">
              <Plus size={16} />
            </Link>
          </div>
          
          {myClans.length > 0 ? (
            <div className="space-y-3">
              {myClans.map(clan => (
                <Link 
                  key={clan.id} 
                  to={`/clan/${clan.id}`}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/50' : 'bg-cyan-50/50 border-cyan-100 hover:border-cyan-300'}`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${clan.color} rounded-xl shadow-md group-hover:scale-105 transition-transform`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm tracking-tight truncate">{clan.name}</p>
                    <p className={`text-[9px] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest`}>{clan.members} MEMBERS</p>
                  </div>
                  <ChevronRight size={14} className="text-cyan-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          ) : (
            <Link to="/clans" className={`block p-6 rounded-3xl border border-dashed text-center transition-all ${theme === 'dark' ? 'border-gray-800 hover:border-cyan-500/50 bg-gray-900/20' : 'border-gray-200 hover:border-cyan-500/50 bg-gray-50/50'}`}>
              <p className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.yourNotInAClanYet', language)}</p>
              <span className="text-xs font-black text-cyan-500 uppercase tracking-widest">{t('common.joinAClan', language)}</span>
            </Link>
          )}
        </div>

        {/* Achievements Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xs tracking-widest uppercase">{t('common.achievements', language)}</h3>
            <Link to="/achievements" className={`text-[10px] font-black text-cyan-500 hover:text-blue-500 uppercase tracking-widest`}>VIEW ALL</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.slice(0, 4).map((achievement) => {
              const isUnlocked = (user.unlockedAchievements || []).includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-[1.5rem] border-2 transition-all ${isUnlocked
                    ? 'border-yellow-400/50 bg-yellow-500/5'
                    : theme === 'dark' ? 'border-gray-800 bg-gray-900/40 opacity-40' : 'border-gray-100 bg-gray-50/50 opacity-40'}`}
                >
                  <Trophy size={20} className={isUnlocked ? 'text-yellow-500 mb-2' : 'text-gray-400 mb-2'} fill={isUnlocked ? "currentColor" : "none"} />
                  <p className={`text-[11px] font-black leading-tight mb-1 truncate ${isUnlocked ? '' : 'text-gray-500'}`}>{getAchievementText(achievement, 'name', language)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
