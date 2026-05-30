import { useState, useMemo } from 'react';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';
import Profile from '../components/Profile';
import Avatar from '../components/Avatar';
import { useData, useTheme, useLanguage } from '../context/Contexts';
import { Search, X, Users, MessageSquare, ChevronRight, History, MapPin, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { searchUsers, searchPosts, searchHistory, addSearchHistory } = useData();
  const { theme: currentTheme } = useTheme();
  const { language } = useLanguage();

  const isQueryValid = searchQuery.trim().length >= 3;

  const filteredUsers = useMemo(() => {
    if (!isQueryValid) return [];
    return searchUsers(searchQuery).slice(0, 5);
  }, [searchUsers, searchQuery, isQueryValid]);

  const filteredPosts = useMemo(() => {
    if (!isQueryValid) return [];
    return searchPosts(searchQuery);
  }, [searchPosts, searchQuery, isQueryValid]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && isQueryValid) {
      addSearchHistory(searchQuery.trim());
      setShowHistory(false);
    }
  };

  const selectHistory = (term) => {
    setSearchQuery(term);
    setShowHistory(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Search Bar Container */}
        <div className="relative group">
          <div className="relative z-50">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={language === 'ru' ? 'Поиск (мин. 3 символа)...' : 'Search (min. 3 chars)...'}
              value={searchQuery}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className={`w-full pl-14 pr-12 py-5 rounded-[2rem] border outline-none transition-all duration-300 font-bold text-lg shadow-sm ${currentTheme === 'dark' ? 'bg-gray-900/60 border-white/10 text-white focus:bg-gray-900 focus:border-cyan-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-cyan-600/50 shadow-blue-500/5'}`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && !searchQuery && (
            <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-[2rem] border shadow-2xl z-40 animate-in slide-in-from-top-2 duration-200 ${currentTheme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-4 ml-2">
                <History size={14} className="text-gray-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recent Searches</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, i) => (
                  <button 
                    key={i} 
                    onClick={() => selectHistory(term)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${currentTheme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {searchQuery && isQueryValid ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* User Results */}
            {filteredUsers.length > 0 && (
              <div className={`p-8 rounded-[3rem] border ${currentTheme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white/80 border-white shadow-xl shadow-blue-500/5'} backdrop-blur-xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <Users size={18} className="text-cyan-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{language === 'ru' ? 'ПОЛЬЗОВАТЕЛИ' : 'USERS'}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredUsers.map(user => (
                    <Link 
                      key={user.id} 
                      to={`/user/${user.id}`}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${currentTheme === 'dark' ? 'bg-gray-950/40 border-white/5 hover:border-cyan-500/30' : 'bg-gray-50/50 border-gray-100 hover:border-cyan-200 hover:bg-white shadow-sm'}`}
                    >
                      <Avatar user={user} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={10} />
                          <p className="text-[9px] font-bold uppercase tracking-widest truncate">{user.city || 'Unknown'}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Post Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2 ml-4">
                <MessageSquare size={18} className="text-purple-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{language === 'ru' ? 'ПОСТЫ' : 'POSTS'}</h3>
              </div>
              {filteredPosts.length > 0 ? (
                <Feed posts={filteredPosts} />
              ) : (
                <div className="text-center py-20 opacity-40">
                  <SearchX size={48} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm">No matches found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        ) : searchQuery && !isQueryValid ? (
           <div className="text-center py-20 opacity-30">
              <p className="font-black uppercase tracking-widest text-xs">Keep typing to search...</p>
           </div>
        ) : (
          <>
            <CreatePost />
            <Feed />
          </>
        )}
      </div>

      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24">
          <Profile />
        </div>
      </div>
    </div>
  );
}
