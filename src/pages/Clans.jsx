import { useState, useMemo } from 'react';
import { useData, useTheme, useLanguage, useAuth } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trophy, ChevronRight, Trash2, Search, Filter, X } from 'lucide-react';

export default function Clans() {
  const { clans = [], joinedClans = [], joinClan, leaveClan, deleteClan } = useData();
  const { currentUser = {} } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = ['sport', 'education', 'earning', 'selfKnowledge', 'creativity'];

  const filteredClans = useMemo(() => {
    let result = Array.isArray(clans) ? clans : [];
    if (activeFilter !== 'all') {
      result = result.filter(c => c.category === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return result;
  }, [clans, activeFilter, searchQuery]);

  const handleToggleJoin = (e, clanId) => {
    e.stopPropagation();
    const isJoined = Array.isArray(joinedClans) && joinedClans.includes(clanId);
    if (isJoined) {
      if (typeof leaveClan === 'function') leaveClan(currentUser?.id, clanId);
    } else {
      if (typeof joinClan === 'function') joinClan(currentUser?.id, clanId);
    }
  };

  const handleDeleteClan = (e, clanId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this clan?')) {
      deleteClan(clanId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t('nav.clans', language)}</h1>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Find your team and dominate the leaderboards</p>
        </div>
        <button
          onClick={() => navigate('/create-clan')}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
        >
          <Plus size={20} />
          {t('common.createClan', language)}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-12">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={t('common.searchClans', language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-12 py-4 rounded-2xl border outline-none transition-all font-bold ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 text-white focus:border-cyan-500/50' : 'bg-white border-gray-100 shadow-sm focus:border-cyan-600/50'}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${activeFilter === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
              : theme === 'dark' ? 'bg-gray-900 border-white/10 text-gray-500' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            {language === 'ru' ? 'Все' : language === 'zh' ? '全部' : 'All'}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${activeFilter === cat
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                : theme === 'dark' ? 'bg-gray-900 border-white/10 text-gray-500' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              {t(`common.${cat}`, language)}
            </button>
          ))}
        </div>
      </div>

      {filteredClans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredClans.map((clan) => {
            const isJoined = Array.isArray(joinedClans) && joinedClans.includes(clan.id);
            return (
              <div
                key={clan.id}
                className={`group rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-white shadow-xl shadow-blue-500/5 border-white hover:border-cyan-200'} backdrop-blur-xl p-8 hover:-translate-y-1 ${isJoined ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => {
                  if (isJoined) {
                    navigate(`/clan/${clan.id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${clan.color || 'from-gray-500 to-gray-700'} rounded-2xl shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`} />
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="text-xl font-black tracking-tight">{clan.name}</h3>
                         {clan.isPrivate && <Lock size={14} className="text-gray-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={12} className="text-gray-500" />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{clan.members} MEMBERS</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {isJoined && (
                      <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-xl text-[10px] font-black tracking-widest uppercase border border-green-500/20">
                        {t('common.joined', language).toUpperCase()}
                      </div>
                    )}
                    {currentUser?.id === clan.ownerId && (
                      <button 
                        onClick={(e) => handleDeleteClan(e, clan.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete Clan"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <p className={`text-sm font-medium leading-relaxed mb-8 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{clan.description}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="font-black text-sm tracking-tight">{clan.points || 0} <span className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">{t('common.points', language)}</span></span>
                  </div>

                  {!isJoined && (
                    <button
                      onClick={(e) => handleToggleJoin(e, clan.id)}
                      className="flex items-center gap-1 text-cyan-500 hover:text-blue-500 font-black text-xs tracking-widest uppercase transition-colors"
                    >
                      {t('common.joinAClan', language)}
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 opacity-40">
          <Filter size={48} className="mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest">No clans found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
