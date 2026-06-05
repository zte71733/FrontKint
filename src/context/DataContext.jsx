import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { useAuth, DataContext } from './Contexts';
import { MOCK_POSTS, MOCK_USERS_LIST, MOCK_CLANS, MOCK_QUESTS, MOCK_ACHIEVEMENTS } from '../mockData';

export function DataProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  const getDB = useCallback(() => {
    try {
      const db = localStorage.getItem('kint_db');
      if (!db || db === 'undefined') return null;
      const parsed = JSON.parse(db);
      if (!parsed.users || !Array.isArray(parsed.users)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const saveDB = useCallback((data) => {
    try {
      localStorage.setItem('kint_db', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, []);

  const [users, setUsers] = useState(MOCK_USERS_LIST);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [quests, setQuests] = useState(MOCK_QUESTS);
  const [achievements, setAchievements] = useState(MOCK_ACHIEVEMENTS);
  const [clans, setClans] = useState(MOCK_CLANS);
  const [clanMessages, setClanMessages] = useState({});
  const [joinRequests, setJoinRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const joinedClans = useMemo(() => {
    if (!currentUser) return [];
    return (clans || []).filter(c => (c.memberIds || []).includes(currentUser.id)).map(c => c.id);
  }, [clans, currentUser]);

  const [globalError, setGlobalError] = useState(null);

  const clearGlobalError = useCallback(() => setGlobalError(null), []);

  useEffect(() => {
    const handleError = (e) => {
      if (e.detail?.status >= 500) {
        setGlobalError('Server is currently unavailable. Please try again later.');
      }
    };
    window.addEventListener('api-error', handleError);
    return () => window.removeEventListener('api-error', handleError);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      Promise.resolve().then(() => {
        setUsers(prev => {
          const arr = Array.isArray(prev) ? prev : [];
          if (arr.find(u => u.id === currentUser.id)) {
             return arr.map(u => u.id === currentUser.id ? { ...u, ...currentUser, lastSeen: new Date().toISOString() } : u);
          }
          return [...arr, { ...currentUser, lastSeen: new Date().toISOString() }];
        });
      });
    }
  }, [isAuthenticated, currentUser]);

  const [searchHistory, setSearchHistory] = useState(() => getDB()?.searchHistory || []);

  const addSearchHistory = useCallback((term) => {
    if (!term) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(t => t !== term);
      return [term, ...filtered].slice(0, 10);
    });
  }, []);

  const clearSearchHistory = useCallback(() => setSearchHistory([]), []);

  useEffect(() => {
    if (Array.isArray(users) && users.length > 0) {
      saveDB({ users, posts, quests, achievements, clans, clanMessages, joinRequests, searchHistory });
    }
  }, [users, posts, quests, achievements, clans, clanMessages, joinRequests, searchHistory, saveDB]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [feedData, usersData] = await Promise.all([
        api.get('/api/daily/feed'),
        api.get('/api/users/list')
      ]);
      if (feedData && Array.isArray(feedData)) setPosts(feedData);
      if (usersData && Array.isArray(usersData)) setUsers(usersData);
    } catch {
      // Standalone mode is handled in api.js
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  const addPost = useCallback(async (userId, title, description, category, image) => {
    try {
      const newEntry = await api.post('/api/daily/', { title, description, category, image_url: image, visibility: 'public' });
      setPosts(prev => [newEntry, ...prev]);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: (u.points || 0) + 25 } : u));
    } catch {
      const author = users.find(u => u.id === userId);
      const mockEntry = {
        id: Date.now(),
        authorId: userId,
        authorName: author?.name || 'You',
        authorAvatar: author?.avatar || '',
        title, description, category, image,
        timestamp: new Date().toISOString(),
        likes: 0, liked: false, comments: [], points: 25
      };
      setPosts(prev => [mockEntry, ...prev]);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: (u.points || 0) + 25 } : u));
    }
  }, [users]);

  const updatePost = useCallback(async (postId, updates) => {
    try {
      const updated = await api.put(`/api/daily/${postId}`, updates);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updated } : p));
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      await api.delete(`/api/daily/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  }, []);

  const toggleLike = useCallback(async (postId, userId) => {
    try {
      await api.post(`/api/daily/${postId}/like`);
    } catch (err) {
      console.warn('Failed to toggle like on server:', err);
    }
    setPosts(prev => (prev || []).map(p => {
      if (p.id === postId) {
        const likes = (p.likes || []);
        const alreadyLiked = Array.isArray(likes) && likes.includes(userId);
        return { 
          ...p, 
          likes: alreadyLiked ? likes.filter(id => id !== userId) : [...likes, userId] 
        };
      }
      return p;
    }));
  }, []);

  const addComment = useCallback(async (postId, userId, text, parentId = null) => {
    try {
      const comment = await api.post(`/api/daily/${postId}/comment`, { text, parent_id: parentId });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p));
    } catch {
      const author = users.find(u => u.id === userId);
      const mockComment = {
        id: Date.now(),
        authorId: userId,
        authorName: author?.name || 'You',
        authorAvatar: author?.avatar || '',
        text, 
        parentId,
        timestamp: new Date().toISOString()
      };
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), mockComment] } : p));
    }
  }, [users]);

  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      await api.delete(`/api/daily/${postId}/comment/${commentId}`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
    }
  }, []);

  const isFollowing = useCallback((followerId, followingId) => {
    const user = users.find(u => u.id === followerId);
    return (user?.followingIds || []).includes(followingId);
  }, [users]);

  const toggleFollow = useCallback(async (followerId, followingId) => {
    if (followerId === followingId) return;
    try {
      const { isFollowing: currentlyFollowing } = await api.get(`/api/social/follow/${followingId}/status`);
      if (currentlyFollowing) await api.delete(`/api/social/follow/${followingId}`);
      else await api.post('/api/social/follow', { target_user_id: followingId });
      fetchData();
    } catch {
      setUsers(prev => prev.map(u => {
        if (u.id === followerId) {
          const fIds = u.followingIds || [];
          const alreadyFollowing = fIds.includes(followingId);
          return {
            ...u,
            followingIds: alreadyFollowing ? fIds.filter(id => id !== followingId) : [...fIds, followingId],
            following: alreadyFollowing ? Math.max(0, (u.following || 1) - 1) : (u.following || 0) + 1
          };
        }
        if (u.id === followingId) {
          const followerIds = u.followerIds || [];
          const alreadyFollower = followerIds.includes(followerId);
          return { 
            ...u, 
            followerIds: alreadyFollower ? followerIds.filter(id => id !== followerId) : [...followerIds, followerId],
            followers: alreadyFollower ? Math.max(0, (u.followers || 1) - 1) : (u.followers || 0) + 1 
          };
        }
        return u;
      }));
    }
  }, [fetchData]);

  const blockUser = useCallback(async (blockerId, blockedId) => {
    try {
      await api.post('/api/social/block', { target_user_id: blockedId });
    } catch (err) {
      console.warn('Failed to block user on server:', err);
    }
    setUsers(prev => prev.map(u => {
      if (u.id === blockerId) {
        const blocked = u.blockedUsers || [];
        return { ...u, blockedUsers: blocked.includes(blockedId) ? blocked : [...blocked, blockedId] };
      }
      return u;
    }));
  }, []);

  const unblockUser = useCallback(async (blockerId, blockedId) => {
    try {
      await api.delete(`/api/social/block/${blockedId}`);
    } catch (err) {
      console.warn('Failed to unblock user on server:', err);
    }
    setUsers(prev => prev.map(u => u.id === blockerId ? { ...u, blockedUsers: (u.blockedUsers || []).filter(id => id !== blockedId) } : u));
  }, []);

  const searchUsers = useCallback((query) => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users]);

  const searchPosts = useCallback((query) => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
  }, [posts]);

  const searchClans = useCallback((query, filter = 'all') => {
    let filtered = clans;
    if (filter !== 'all') {
      filtered = clans.filter(c => c.category === filter);
    }
    if (!query) return filtered;
    const q = query.toLowerCase();
    return filtered.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [clans]);

  const calculateLevel = useCallback((points) => {
    if (points < 100) return 1;
    if (points < 200) return 2;
    let a = 1, b = 2, level = 2;
    while (points >= b * 100) {
      let next = a + b;
      a = b; b = next;
      level++;
    }
    return level;
  }, []);

  const getXpForLevel = useCallback((level) => {
    if (level <= 1) return 0;
    if (level === 2) return 100;
    let a = 1, b = 2;
    for (let i = 3; i < level; i++) {
      let next = a + b;
      a = b; b = next;
    }
    return b * 100;
  }, []);

  const getXpNeeded = useCallback((points) => {
    const level = calculateLevel(points);
    return getXpForLevel(level + 1);
  }, [calculateLevel, getXpForLevel]);

  const getCurrentLevelProgress = useCallback((points) => {
    const level = calculateLevel(points);
    const xpForCurrentLevel = getXpForLevel(level);
    const xpForNextLevel = getXpNeeded(points);
    const range = xpForNextLevel - xpForCurrentLevel;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(((points - xpForCurrentLevel) / range) * 100, 100));
  }, [calculateLevel, getXpForLevel, getXpNeeded]);

  const toggleQuest = useCallback((questId) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: !q.completed } : q));
  }, []);

  const completeQuest = useCallback((questId, userId, photoUrl = null) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const completions = q.completions || [];
        if (completions.find(c => c.userId === userId)) return q;
        return { 
          ...q, 
          completions: [...completions, { userId, photoUrl, timestamp: new Date().toISOString() }] 
        };
      }
      return q;
    }));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: (u.points || 0) + (quest.points || 50) } : u));
  }, [quests]);

  const cancelQuestCompletion = useCallback((questId, userId) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, completions: (q.completions || []).filter(c => c.userId !== userId) };
      }
      return q;
    }));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: Math.max(0, (u.points || 0) - (quest.points || 50)) } : u));
  }, [quests]);

  const deleteUser = useCallback((userId) => {
    if (!currentUser?.isAdmin) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUser]);
  
  const deleteQuest = useCallback((questId) => {
    if (!currentUser?.isAdmin) return;
    setQuests(prev => prev.filter(q => q.id !== questId));
  }, [currentUser]);

  const addQuest = useCallback((title, description, category, points, assignedTo) => {
    if (!currentUser?.isAdmin) return;
    const newQuest = {
      id: Date.now(),
      title, description, category, points,
      assignedTo: assignedTo || null,
      completions: [],
      icon: 'Target',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    setQuests(prev => [newQuest, ...prev]);
  }, [currentUser]);

  const updateQuest = useCallback((questId, updates) => {
    if (!currentUser?.isAdmin) return;
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, ...updates } : q));
  }, [currentUser]);

  const removeQuestFromUser = useCallback((questId, userId) => {
    if (!currentUser?.isAdmin) return;
    setQuests(prev => prev.map(q => (q.id === questId && q.assignedTo) ? { ...q, assignedTo: q.assignedTo.filter(id => id !== userId) } : q));
  }, [currentUser]);

  const removeQuestFromAll = useCallback((questId) => {
    if (!currentUser?.isAdmin) return;
    setQuests(prev => prev.filter(q => q.id !== questId));
  }, [currentUser]);

  const addAchievement = useCallback((name, description, category, type, target) => {
    if (!currentUser?.isAdmin) return;
    const newAchievement = { id: Date.now(), name, description, category, type, target, unlocked: false, icon: 'Medal' };
    setAchievements(prev => [newAchievement, ...prev]);
  }, [currentUser]);

  const deleteAchievement = useCallback((achievementId) => {
    if (!currentUser?.isAdmin) return;
    setAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, [currentUser]);
  
  const deleteClan = useCallback((clanId) => {
    setClans(prev => {
      const clan = prev.find(c => c.id === clanId);
      if (!clan) return prev;
      if (clan.ownerId !== currentUser?.id && !currentUser?.isAdmin) return prev;
      return prev.filter(c => c.id !== clanId);
    });
  }, [currentUser]);

  const unlockUserAchievement = useCallback((userId, achievementId) => {
    if (!currentUser?.isAdmin) return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const unlocked = u.unlockedAchievements || [];
        return { ...u, unlockedAchievements: unlocked.includes(achievementId) ? unlocked : [...unlocked, achievementId] };
      }
      return u;
    }));
  }, [currentUser]);

  const lockUserAchievement = useCallback((userId, achievementId) => {
    if (!currentUser?.isAdmin) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, unlockedAchievements: (u.unlockedAchievements || []).filter(id => id !== achievementId) } : u));
  }, [currentUser]);

  const banUser = useCallback(async (userId) => {
    if (!currentUser?.isAdmin) return;
    try {
      await api.post(`/api/admin/users/${userId}/ban`);
    } catch (err) {
      console.warn('Failed to ban user on server:', err);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
  }, [currentUser]);
  
  const unbanUser = useCallback(async (userId) => {
    if (!currentUser?.isAdmin) return;
    try {
      await api.post(`/api/admin/users/${userId}/unban`);
    } catch (err) {
      console.warn('Failed to unban user on server:', err);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false } : u));
  }, [currentUser]);
  
  const toggleAdmin = useCallback(async (userId) => {
    if (!currentUser?.isAdmin) return;
    try {
      await api.post(`/api/admin/users/${userId}/toggle-admin`);
    } catch (err) {
      console.warn('Failed to toggle admin on server:', err);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin, role: !u.isAdmin ? 'admin' : 'user' } : u));
  }, [currentUser]);

  const createClan = useCallback(async (userId, name, description, color, options = {}) => {
    const newClan = { 
      id: Date.now(), 
      name, 
      description, 
      color, 
      ownerId: userId, 
      memberIds: [userId], 
      points: 0,
      isPrivate: options.isPrivate || false,
      joinMethod: options.joinMethod || 'open', // 'open', 'approval', 'password'
      password: options.password || ''
    };
    setClans(prev => [...(prev || []), newClan]);
  }, []);

  const joinClan = useCallback(async (userId, clanId, password = '') => {
    const clan = clans.find(c => c.id === clanId);
    if (!clan) return;

    if ((clan.memberIds || []).includes(userId)) return;

    if (clan.joinMethod === 'password') {
      if (clan.password !== password) {
        throw new Error('Incorrect clan password');
      }
    } else if (clan.joinMethod === 'approval') {
      setJoinRequests(prev => {
        if ((prev || []).find(r => r.userId === userId && r.clanId === clanId)) return prev;
        return [...(prev || []), { id: Date.now(), userId, clanId, timestamp: new Date().toISOString() }];
      });
      return;
    }

    setClans(prev => (prev || []).map(c => {
       if (c.id === clanId) {
          const mIds = c.memberIds || [];
          return { ...c, memberIds: [...mIds, userId] };
       }
       return c;
    }));
  }, [clans]);

  const leaveClan = useCallback(async (userId, clanId) => {
    setClans(prev => (prev || []).map(c => {
       if (c.id === clanId) {
          const mIds = (c.memberIds || []).filter(id => id !== userId);
          return { ...c, memberIds: mIds };
       }
       return c;
    }));
  }, []);

  const acceptJoinRequest = useCallback((requestId) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    const clan = clans.find(c => c.id === request.clanId);
    if (!clan || clan.ownerId !== currentUser?.id) return; // Security check

    setClans(prev => (prev || []).map(c => {
       if (c.id === request.clanId) {
          const mIds = c.memberIds || [];
          if (mIds.includes(request.userId)) return c;
          return { ...c, memberIds: [...mIds, request.userId] };
       }
       return c;
    }));

    setJoinRequests(prev => prev.filter(r => r.id !== requestId));
  }, [joinRequests, clans, currentUser]);

  const rejectJoinRequest = useCallback((requestId) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const clan = clans.find(c => c.id === request.clanId);
    if (!clan || clan.ownerId !== currentUser?.id) return; // Security check

    setJoinRequests(prev => prev.filter(r => r.id !== requestId));
  }, [joinRequests, clans, currentUser]);

  const sendClanMessage = useCallback((clanId, message) => {
    setClanMessages(prev => ({
      ...(prev || {}),
      [clanId]: [...((prev && prev[clanId]) || []), message]
    }));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem('kint_db');
    setUsers(MOCK_USERS_LIST);
    setPosts(MOCK_POSTS);
    setQuests(MOCK_QUESTS);
    setAchievements(MOCK_ACHIEVEMENTS);
    setClans(MOCK_CLANS);
    setClanMessages({});
    setJoinRequests([]);
  }, []);

  return (
    <DataContext.Provider value={{
      users, setUsers, posts, quests, achievements, clans, joinedClans, clanMessages, joinRequests, isLoading,
      addPost, updatePost, deletePost, toggleLike, addComment, deleteComment, isFollowing, toggleFollow, blockUser, unblockUser,
      searchUsers, searchPosts, searchClans, searchHistory, addSearchHistory, clearSearchHistory,
      calculateLevel, getXpForLevel, getXpNeeded, getCurrentLevelProgress, fetchData,
      toggleQuest, completeQuest, cancelQuestCompletion, deleteUser, deleteQuest, addQuest, updateQuest,
      removeQuestFromUser, removeQuestFromAll, addAchievement, deleteAchievement, deleteClan,
      unlockUserAchievement, lockUserAchievement, banUser, unbanUser, toggleAdmin,
      createClan, joinClan, leaveClan, acceptJoinRequest, rejectJoinRequest, sendClanMessage, resetAllData, globalError, clearGlobalError
    }}>
      {children}
    </DataContext.Provider>
  );
}
