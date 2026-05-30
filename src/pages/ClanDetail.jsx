import { useState, useEffect } from 'react';
import { useData, useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { ArrowLeft, MessageSquare, Send, Users, Trophy, Shield, Info, Crown, Trash2, LogOut, Lock } from 'lucide-react';

export default function ClanDetail() {
  const { id } = useParams();
  const { clans = [], users = [], joinedClans = [], joinClan, leaveClan, deleteClan, clanMessages = {}, sendClanMessage, joinRequests = [], acceptJoinRequest, rejectJoinRequest } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');

  const clan = (clans || []).find(c => c.id === parseInt(id));
  const isOwner = clan?.ownerId === currentUser?.id;
  const isJoined = clan && (clan.memberIds || []).includes(currentUser?.id);
  
  // Security: Only allow access to messages if the user is a member
  const messages = (isJoined && clan && clanMessages && clanMessages[clan.id]) || [];
  
  const pendingRequest = !isJoined && (joinRequests || []).find(r => r.userId === currentUser?.id && r.clanId === clan?.id);
  const clanRequests = isOwner ? (joinRequests || []).filter(r => r.clanId === clan?.id) : [];

  // Initialize with a welcome message if no messages exist
  useEffect(() => {
    if (clan && messages.length === 0 && typeof sendClanMessage === 'function') {
      sendClanMessage(clan.id, { 
        id: 'welcome', 
        authorId: 'system', 
        authorName: 'Kint Bot', 
        authorAvatar: '', 
        text: `Welcome to ${clan.name}! This is your general chat.`, 
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() 
      });
    }
  }, [clan, messages.length, sendClanMessage]);

  if (!clan) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-3xl font-black mb-4 uppercase">{t('common.clanNotFound', language)}</h1>
        <button onClick={() => navigate('/clans')} className="text-cyan-500 hover:text-blue-500 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} />
          {t('common.backToClans', language)}
        </button>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (message.trim() && currentUser && typeof sendClanMessage === 'function') {
      sendClanMessage(clan.id, { 
        id: Date.now(), 
        authorId: currentUser.id, 
        authorName: currentUser.name, 
        authorAvatar: currentUser.avatar, 
        text: message.trim(), 
        timestamp: new Date().toISOString() 
      });
      setMessage('');
    }
  };

  const handleJoin = async () => {
    if (!currentUser) return;
    if (clan.joinMethod === 'password' && !showPasswordModal) {
      setShowPasswordModal(true);
      return;
    }
    setError('');
    try {
      await joinClan(currentUser.id, clan.id, joinPassword);
      setShowPasswordModal(false);
      setJoinPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = () => {
    if (isOwner) return;
    if (window.confirm(t('common.confirmLeaveClan', language))) {
      leaveClan(currentUser.id, clan.id);
    }
  };

  const handleDeleteClan = () => {
    if (window.confirm(t('common.deleteClanConfirm', language))) {
      deleteClan(clan.id);
      navigate('/clans');
    }
  };

  const formatTime = (dateString) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return language === 'en' ? 'now' : language === 'ru' ? 'сейчас' : '刚刚';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <button onClick={() => navigate('/clans')} className="flex items-center gap-2 text-cyan-500 hover:text-blue-500 mb-8 font-black tracking-widest uppercase text-xs transition-colors">
        <ArrowLeft size={14} />
        {t('common.backToClans', language)}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clan Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`rounded-[3rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white/80 border-white shadow-xl shadow-blue-500/5'} backdrop-blur-xl p-8`}>
            <div className={`w-20 h-20 bg-gradient-to-br ${clan.color} rounded-3xl shadow-xl mb-6 mx-auto md:mx-0 flex items-center justify-center text-white`}>
              <Shield size={40} strokeWidth={2.5} />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
               <h1 className="text-3xl font-black tracking-tight">{clan.name}</h1>
               {clan.isPrivate && <Lock size={16} className="text-gray-500" />}
            </div>
            
            {isOwner && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
                <Crown size={12} fill="currentColor" />
                {t('common.owner', language)}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-6">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-500/5 text-gray-500 border border-gray-500/10`}>
                <Users size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{clan.members} {t('common.members', language)}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl bg-yellow-500/5 text-yellow-500 border border-yellow-500/10`}>
                <Trophy size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{clan.points} XP</span>
              </div>
            </div>

            <p className={`text-sm font-medium leading-relaxed mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{clan.description}</p>
            
            <div className="space-y-3">
              {isJoined ? (
                !isOwner && (
                  <button
                    onClick={handleLeave}
                    className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase border transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-gray-800 bg-gray-800/40 text-gray-400 hover:text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <LogOut size={16} />
                    {t('common.leaveClan', language)}
                  </button>
                )
              ) : pendingRequest ? (
                <div className="w-full py-4 bg-gray-500/10 text-gray-500 rounded-2xl font-black text-[10px] text-center uppercase tracking-widest border border-gray-500/10">
                   {language === 'ru' ? 'Заявка отправлена' : 'Request Sent'}
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest"
                >
                  {t('common.joinAClan', language)}
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDeleteClan}
                  className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase border transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10' : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  <Trash2 size={16} />
                  {t('common.deleteClan', language).toUpperCase()}
                </button>
              )}
            </div>
          </div>

          {/* Join Requests for Owner */}
          {isOwner && clanRequests.length > 0 && (
             <div className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-white shadow-xl shadow-blue-500/5 border-white'} backdrop-blur-xl p-6`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                   <Users size={14} /> {language === 'ru' ? 'Заявки на вступление' : 'Join Requests'}
                   <span className="ml-auto w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px]">{clanRequests.length}</span>
                </h3>
                <div className="space-y-4">
                   {clanRequests.map(req => {
                      const user = users.find(u => u.id === req.userId);
                      return (
                        <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-500/5 border border-white/5">
                           <div className="flex items-center gap-2 min-w-0">
                              <Avatar user={user} size="sm" />
                              <span className="text-[10px] font-black uppercase truncate">{user?.name}</span>
                           </div>
                           <div className="flex gap-1 text-white">
                              <button onClick={() => acceptJoinRequest(req.id)} className="p-2 bg-green-500 rounded-lg hover:scale-105 transition-all"><Check size={14} /></button>
                              <button onClick={() => rejectJoinRequest(req.id)} className="p-2 bg-red-500 rounded-lg hover:scale-105 transition-all"><X size={14} /></button>
                           </div>
                        </div>
                      )
                   })}
                </div>
             </div>
          )}
        </div>

        {/* Clan Chat Area */}
        <div className="lg:col-span-2">
          <div className={`h-[600px] flex flex-col rounded-[3rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white/50 border-white shadow-xl shadow-blue-500/5'} backdrop-blur-xl`}>
            <div className="p-6 border-b border-gray-100 dark:divide-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase">{t('common.clanChat', language)}</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{isJoined ? t('common.activeSession', language) : t('common.readOnlyPreview', language)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {isJoined ? (
                messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Info size={40} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">{t('common.noMessages', language)}</p>
                    <p className="text-xs">{language === 'ru' ? 'Будьте первым, кто начнет беседу!' : language === 'zh' ? '成为第一个开始对话的人！' : 'Be the first to start the conversation!'}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.authorId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <Avatar user={users.find(u => u.id === msg.authorId)} size={36} className="rounded-xl border-2 border-white/5 mt-auto" />
                        <div className={`max-w-[80%] ${isOwn ? 'items-end' : ''}`}>
                          {!isOwn && <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 ml-2">{msg.authorName}</p>}
                          <div className={`p-4 rounded-[1.5rem] shadow-sm ${isOwn 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-none' 
                            : theme === 'dark' ? 'bg-gray-800 text-white rounded-bl-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'}`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <p className={`text-[9px] font-bold text-gray-500 mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500 mb-6">
                    <Lock size={32} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-2 uppercase">{t('common.clanChat', language)}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-8 max-w-[240px]">{t('common.joinTheClanToAccessTheChat', language)}</p>
                  <button
                    onClick={handleJoin}
                    className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('common.joinAClan', language)}
                  </button>
                </div>
              )}
            </div>

            {isJoined && (
              <div className="p-6 pt-0">
                <div className={`flex items-center gap-2 p-2 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-950/50 border-white/5' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
                  <input
                    type="text"
                    placeholder={t('common.typeAMessage', language)}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-lg" onClick={() => setShowPasswordModal(false)}></div>
          <div className={`relative w-full max-w-md rounded-[3rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
             <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black uppercase tracking-tight">{language === 'ru' ? 'Введите пароль' : 'Enter Password'}</h3>
                   <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-xl hover:bg-gray-500/10"><X size={24} /></button>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{language === 'ru' ? 'Пароль клана' : 'Clan Password'}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        className={`w-full p-5 rounded-3xl border font-black text-lg outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
                      />
                      {error && <p className="text-xs font-bold text-red-500 ml-4">{error}</p>}
                   </div>

                   <button 
                     onClick={handleJoin}
                     className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest"
                   >
                     {t('common.joinAClan', language)}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
