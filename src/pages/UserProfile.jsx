import { useState, useMemo } from 'react';
import { useData, useAuth, useTheme, useLanguage } from '../context/Contexts';
import { getAchievementText } from '../mockData';
import { t } from '../i18n/translations';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RadarChart from '../components/RadarChart';
import Avatar from '../components/Avatar';
import { UserMinus, UserCheck, ArrowLeft, Award, Trophy, QrCode, X, Users, ShieldAlert, Lock } from 'lucide-react';
import bannerLight from '../assets/banner-light.png';
import bannerDark from '../assets/banner-dark.png';

function ListModal({ type, list, theme, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-[3rem] border p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black tracking-tight uppercase">{type}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-500/10"><X size={24} /></button>
        </div>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
          {list.length === 0 ? (
            <p className="text-center py-10 text-gray-500 font-bold uppercase text-xs tracking-widest">Nothing here yet</p>
          ) : (
            list.map(u => (
              <Link key={u.id} to={`/user/${u.id}`} onClick={onClose} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <Avatar user={u} size="sm" />
                  <span className="font-black text-sm uppercase">{u.name}</span>
                </div>
                <Users size={16} className="text-gray-400" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams();
  const { users, achievements, toggleFollow, isFollowing, calculateLevel, getXpNeeded, getCurrentLevelProgress, blockUser, unblockUser } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeListModal, setActiveListModal] = useState(null); // 'followers' | 'following' | 'qr'
  
  const profileUser = users.find(u => u.id === parseInt(id));
  const isSelf = currentUser?.id === profileUser?.id;
  const following = isFollowing(currentUser?.id, profileUser?.id);
  const isBlocked = (currentUser?.blockedUsers || []).includes(profileUser?.id);
  const hasBlockedMe = (profileUser?.blockedUsers || []).includes(currentUser?.id);

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

  const followersList = useMemo(() => {
    return users.filter(u => (u.followingIds || []).includes(profileUser?.id));
  }, [users, profileUser]);

  const followingList = useMemo(() => {
    return users.filter(u => (profileUser?.followingIds || []).includes(u.id));
  }, [users, profileUser]);

  const canSeeContent = isSelf || following || !profileUser?.isPrivate;

  if (!profileUser || hasBlockedMe) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          {hasBlockedMe ? t('common.accessDenied', language) : t('common.userNotFound', language)}
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          {hasBlockedMe ? t('common.restrictedAccess', language) : t('common.userDeleted', language)}
        </p>
        <button onClick={() => navigate('/feed')} className="px-8 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95">
          {t('common.backToFeed', language)}
        </button>
      </div>
    );
  }

  const userAchievements = canSeeContent 
    ? achievements.filter(a => (profileUser.unlockedAchievements || []).includes(a.id))
    : [];

  const calculateCategoryProgress = (category) => {
    if (!canSeeContent) return 0;
    const categoryQuests = achievements.filter(a => a.category === category);
    const unlockedInCategory = (profileUser.unlockedAchievements || []).filter(aid => {
      const ach = achievements.find(a => a.id === aid);
      return ach && ach.category === category;
    });
    if (categoryQuests.length === 0) return 0;
    return Math.min(100, (unlockedInCategory.length / categoryQuests.length) * 100);
  };

  const radarData = [
    calculateCategoryProgress('sport'),
    calculateCategoryProgress('education'),
    calculateCategoryProgress('earning'),
    calculateCategoryProgress('selfKnowledge'),
    calculateCategoryProgress('creativity')
  ];

  const handleFollow = () => toggleFollow(currentUser?.id, profileUser.id);

  const handleBlock = () => {
    if (isBlocked) unblockUser(currentUser?.id, profileUser.id);
    else {
      if (window.confirm(`Block ${profileUser.name}? They won't see your posts.`)) {
        blockUser(currentUser?.id, profileUser.id);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Banner */}
      <div className="relative h-60 rounded-[3rem] overflow-hidden shadow-2xl mb-[-4rem] z-0">
        <img 
          src={profileUser.banner || (theme === 'dark' ? bannerDark : bannerLight)} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-8 p-3 rounded-2xl bg-gray-950/20 backdrop-blur-md text-white hover:bg-gray-950/40 transition-all border border-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => setActiveListModal('qr')}
          className="absolute top-8 right-8 p-3 rounded-2xl bg-gray-950/20 backdrop-blur-md text-white hover:bg-gray-950/40 transition-all border border-white/10"
        >
          <QrCode size={20} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="relative z-10 px-4 md:px-8">
        <div className={`rounded-[4rem] border p-8 md:p-10 shadow-2xl ${theme === 'dark' ? 'bg-gray-900/90 border-white/10' : 'bg-gray-50/90 border-white'} backdrop-blur-xl`}>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-10 text-center md:text-left">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <Avatar user={profileUser} size="2xl" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">{profileUser.name}</h1>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-500/10 px-3 py-1 rounded-lg">
                  {formatLastSeen(profileUser.lastSeen)}
                </span>
              </div>
              <p className="text-gray-500 font-bold mb-6 max-w-md">{profileUser.bio || t('common.busyLeveling', language)}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {!isSelf && (
                  <>
                    <button 
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${following 
                        ? (theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900') 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-blue-500/20'}`}
                    >
                      {following ? <UserCheck size={18} /> : <UserCheck size={18} />}
                      {following ? t('common.unfollow', language) : t('common.follow', language)}
                    </button>
                    <button 
                      onClick={handleBlock}
                      className={`p-4 rounded-2xl transition-all border ${isBlocked 
                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
                        : (theme === 'dark' ? 'bg-gray-800 border-white/5 text-gray-400 hover:text-red-400' : 'bg-gray-200 border-gray-300 text-gray-500 hover:text-red-500')}`}
                    >
                      <UserMinus size={20} />
                    </button>
                  </>
                )}
                {isSelf && (
                  <button 
                    onClick={() => navigate('/edit-profile')}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20"
                  >
                    {t('nav.editProfile', language)}
                  </button>
                )}
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-1">{t('common.level', language)}</p>
              <p className="text-5xl font-black tracking-tighter mb-2">{calculateLevel(profileUser.points)}</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-500/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${getCurrentLevelProgress(profileUser.points)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase">{profileUser.points} / {getXpNeeded(profileUser.points)} XP</span>
              </div>
            </div>
          </div>

          {isBlocked ? (
             <div className="py-12 border-t border-white/5 text-center">
                <div className="w-16 h-16 bg-gray-500/10 text-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-500">You have blocked this user</p>
                <button onClick={handleBlock} className="mt-4 text-xs font-black text-cyan-500 uppercase hover:underline">{t('common.unblockToSee', language)}</button>
             </div>
          ) : !canSeeContent ? (
             <div className="py-20 border-t border-white/5 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-cyan-500/10 text-cyan-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/10">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{language === 'ru' ? 'Это приватный аккаунт' : language === 'zh' ? '此账户为私密账户' : 'This Account is Private'}</h3>
                <p className="text-sm font-medium text-gray-500 max-w-[240px] mx-auto">{language === 'ru' ? 'Подпишитесь на пользователя, чтобы видеть его прогресс.' : language === 'zh' ? '关注该用户以查看其进度。' : 'Follow this user to see their progress and achievements.'}</p>
                <button onClick={handleFollow} className="mt-8 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20">{t('common.follow', language)}</button>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5">
                <button onClick={() => setActiveListModal('followers')} className="text-center hover:scale-105 transition-transform group">
                  <p className="text-xl font-black tracking-tight group-hover:text-cyan-500">{profileUser.followers || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('common.followers', language)}</p>
                </button>
                <button onClick={() => setActiveListModal('following')} className="text-center border-x border-white/5 hover:scale-105 transition-transform group">
                  <p className="text-xl font-black tracking-tight group-hover:text-cyan-500">{profileUser.following || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('common.following', language)}</p>
                </button>
                <div className="text-center">
                  <p className="text-xl font-black tracking-tight">{profileUser.points || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('common.points', language).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{t('common.progressByCategory', language)}</h3>
                  </div>
                  <div className="h-64 flex justify-center">
                    <RadarChart data={radarData} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <Trophy size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{t('common.achievements', language)}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {userAchievements.length > 0 ? (
                      userAchievements.map((achievement) => (
                        <div key={achievement.id} className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-gray-950/40 border-white/5' : 'bg-gray-100/50 border-gray-200'}`}>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
                            <Trophy size={18} fill="currentColor" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-tight truncate mb-1">{getAchievementText(achievement, 'name', language)}</p>
                          <p className="text-[9px] font-bold text-gray-500 truncate">{getAchievementText(achievement, 'description', language)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-10 text-center">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('common.noAchievementsYet', language)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeListModal === 'followers' && <ListModal type={t('common.followers', language)} list={followersList} theme={theme} onClose={() => setActiveListModal(null)} />}
      {activeListModal === 'following' && <ListModal type={t('common.following', language)} list={followingList} theme={theme} onClose={() => setActiveListModal(null)} />}
      {activeListModal === 'qr' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-lg" onClick={() => setActiveListModal(null)}></div>
          <div className="relative p-10 bg-white rounded-[4rem] text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">{t('common.scanToConnect', language)}</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">{profileUser.name}'s Profile</p>
            <div className="w-64 h-64 bg-gray-100 rounded-[3rem] border-8 border-gray-100 flex items-center justify-center mx-auto mb-8 relative overflow-hidden shadow-inner">
               <svg width="200" height="200" viewBox="0 0 100 100" className="text-gray-900">
                 <rect width="100" height="100" fill="white" />
                 <path d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v30H0zM40 40h20v20H40z" fill="currentColor" />
                 <rect x="5" y="5" width="20" height="20" fill="white" />
                 <rect x="75" y="5" width="20" height="20" fill="white" />
                 <rect x="5" y="75" width="20" height="20" fill="white" />
                 <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                 <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                 <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                 <path d="M40 0h10v10H40zM60 0h10v10H60zM0 40h10v10H0zM0 60h10v10H0zM90 40h10v10H90zM90 60h10v10H90zM40 90h10v10H40zM60 90h10v10H60z" fill="currentColor" />
                 <path d="M45 45h10v10H45z" fill="white" />
               </svg>
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10"></div>
            </div>
            <button onClick={() => setActiveListModal(null)} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl">{t('common.close', language)}</button>
          </div>
        </div>
      )}
    </div>
  );
}
