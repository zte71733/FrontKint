import { useState, useEffect, useRef, useCallback } from 'react';
import { useData, useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import Post from './Post';

export default function Feed({ posts: externalPosts }) {
  const { posts: globalPosts } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const postsSource = externalPosts || globalPosts;
  const blockedIds = currentUser?.blockedUsers || [];
  const visiblePosts = postsSource.filter(p => !blockedIds.includes(p.authorId));

  const [displayCount, setDisplayCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Simulate API delay
    setTimeout(() => {
      setDisplayCount(prev => prev + 5);
      setIsLoadingMore(false);
    }, 800);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayCount < visiblePosts.length) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayCount, visiblePosts.length, loadMore]);

  if (visiblePosts.length === 0) {
    return (
      <div className={`p-12 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'border-white/10 bg-gray-950/20' : 'border-gray-200 bg-gray-50/50'}`}>
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">{t('common.noPostsYet', language)}</p>
      </div>
    );
  }

  const postsToDisplay = visiblePosts.slice(0, displayCount);

  return (
    <div className="space-y-6">
      {postsToDisplay.map((post) => (
        <Post key={post.id} post={post} />
      ))}

      {/* Infinite Scroll Target */}
      <div ref={observerTarget} className="h-10 w-full" />

      {/* Skeletons when loading more */}
      {isLoadingMore && (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className={`h-64 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-gray-100 border-gray-100'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
