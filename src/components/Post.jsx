import { useState, useMemo } from 'react';
import { useAuth, useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { Link } from 'react-router-dom';
import ImageModal from './ImageModal';
import Avatar from './Avatar';
import { Heart, MoreHorizontal, MessageSquare, Send, Trash2, Edit2, X, Save, AlertTriangle, CornerDownRight } from 'lucide-react';

export default function Post({ post }) {
  const { users, toggleLike, addComment, deleteComment, deletePost, updatePost } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, authorName }
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editData, setEditData] = useState({ title: post.title, description: post.description, category: post.category });
  const [likeAnimating, setLikeAnimating] = useState(false);

  const blockedIds = useMemo(() => currentUser?.blockedUsers || [], [currentUser?.blockedUsers]);
  
  // Threaded comments logic
  const comments = useMemo(() => {
    const raw = (post.comments || []).filter(c => !blockedIds.includes(c.authorId));
    const main = raw.filter(c => !c.parentId);
    const replies = raw.filter(c => c.parentId);
    
    return main.map(m => ({
      ...m,
      replies: replies.filter(r => r.parentId === m.id)
    }));
  }, [post.comments, blockedIds]);

  const isOwner = currentUser?.id === post.authorId || currentUser?.role === 'admin';

  const handleAddComment = () => {
    if (commentText.trim() && currentUser) {
      addComment(post.id, currentUser.id, commentText, replyTo?.id);
      setCommentText('');
      setReplyTo(null);
      setShowComments(true);
    }
  };

  const isLiked = Array.isArray(post.likes) && post.likes.includes(currentUser?.id);
  const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;

  const handleLike = () => {
    if (currentUser) {
      toggleLike(post.id, currentUser.id);
      if (!isLiked) {
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 600);
      }
    }
  };

  const handleUpdate = () => {
    updatePost(post.id, editData);
    setIsEditing(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm(t('common.deletePostConfirm', language))) {
      deletePost(post.id);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (!date || isNaN(date.getTime())) return '...';
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days > 0) return language === 'en' ? `${days}d` : language === 'ru' ? `${days}д` : `${days}天`;
      if (hours > 0) return language === 'en' ? `${hours}h` : language === 'ru' ? `${hours}ч` : `${hours}小时`;
      if (minutes > 0) return language === 'en' ? `${minutes}m` : language === 'ru' ? `${minutes}м` : `${minutes}分`;
      return language === 'en' ? 'now' : language === 'ru' ? 'сейчас' : '刚刚';
    } catch {
      return '...';
    }
  };

  const getFullDate = (dateString) => {
     return new Date(dateString).toLocaleString(language, { 
       day: 'numeric', month: 'short', year: 'numeric', 
       hour: '2-digit', minute: '2-digit' 
     });
  };

  const getCategoryColor = (category) => {
    const colors = {
      sport: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      education: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      earning: 'text-green-500 bg-green-500/10 border-green-500/20',
      selfKnowledge: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      creativity: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    };
    return colors[category] || colors.creativity;
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`group/comm flex gap-3 p-4 rounded-3xl transition-all ${theme === 'dark' ? 'bg-gray-900/40 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
      <Link to={`/user/${comment.authorId}`}>
        <Avatar user={users.find(u => u.id === comment.authorId)} size={isReply ? 28 : 32} className="rounded-xl mt-1" showHoverCard />
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link to={`/user/${comment.authorId}`} className="font-black text-xs hover:text-cyan-500 transition-colors uppercase tracking-tight">{comment.authorName}</Link>
            {(currentUser?.id === comment.authorId || currentUser?.role === 'admin') && (
              <button 
                onClick={() => deleteComment(post.id, comment.id)}
                className="opacity-0 group-hover/comm:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <span className="text-[10px] font-bold text-gray-500" title={getFullDate(comment.timestamp)}>{formatTime(comment.timestamp)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{comment.text}</p>
        {!isReply && (
          <button 
            onClick={() => { setReplyTo({ id: comment.id, authorName: comment.authorName }); setShowComments(true); }}
            className="mt-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-blue-500 transition-colors"
          >
            {t('common.reply', language)}
          </button>
        )}
      </div>
    </div>
  );

  if (!post.authorId) return null;

  return (
    <>
      <div className={`mb-6 rounded-[2.5rem] border transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900/60 border-white/10 shadow-black/40' : 'bg-white/80 border-white shadow-blue-500/10'} backdrop-blur-xl overflow-hidden group relative`}>
        {/* Post Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/user/${post.authorId}`}>
              <Avatar user={users.find(u => u.id === post.authorId)} size={48} className="rounded-2xl border-2 border-cyan-500/10 group-hover:scale-105 transition-transform" showHoverCard />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/user/${post.authorId}`} className="font-black text-sm tracking-tight hover:text-cyan-500 transition-colors">{post.authorName}</Link>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(post.category)}`}>
                  {t(`common.${post.category}`, language)}
                </span>
              </div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} title={getFullDate(post.timestamp)}>
                {formatTime(post.timestamp)} {post.updatedAt && <span className="opacity-50 lowercase ml-1">(ред.)</span>}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              aria-label="Post Actions"
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showActions && (
              <div className={`absolute right-0 top-full mt-2 w-40 rounded-2xl border shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'}`}>
                {isOwner && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-500/10 transition-colors">
                      <Edit2 size={14} className="text-cyan-500" /> {t('common.edit', language).toUpperCase()}
                    </button>
                    <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 text-red-500 transition-colors border-t border-white/5">
                      <Trash2 size={14} /> {t('common.delete', language).toUpperCase()}
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button onClick={() => { setIsReporting(true); setShowActions(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 text-red-500 transition-colors">
                    <AlertTriangle size={14} /> {t('common.report', language).toUpperCase()}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="px-8 pb-4">
          <h3 className="text-xl font-black tracking-tight mb-2 leading-tight">{post.title}</h3>
          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{post.description}</p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="px-4 pb-4">
            <div className="rounded-[2rem] overflow-hidden cursor-pointer shadow-lg border border-white/10">
              <img
                src={post.image}
                alt={post.title}
                onClick={() => setIsImageModalOpen(true)}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        )}

        {/* Post Footer/Actions */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              aria-label={isLiked ? "Unlike" : "Like"}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all relative overflow-hidden ${isLiked 
                ? 'bg-rose-500/10 text-rose-500 font-bold' 
                : theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-50 text-gray-500'}`}
            >
              <Heart 
                size={20} 
                fill={isLiked ? "currentColor" : "none"} 
                className={`transition-transform duration-300 ${likeAnimating ? 'scale-[1.5] animate-bounce' : ''}`}
              />
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              aria-label="View Comments"
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${showComments 
                ? 'bg-cyan-500/10 text-cyan-500 font-bold' 
                : theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-50 text-gray-500'}`}
            >
              <MessageSquare size={20} />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </button>
          </div>

          <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black tracking-widest shadow-lg shadow-blue-500/20`}>
            +{post.points} XP
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
            <div className={`space-y-4 mb-6 ${comments.length > 0 ? 'mt-4' : ''}`}>
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <CommentItem comment={comment} />
                  {comment.replies.length > 0 && (
                    <div className="pl-8 space-y-3 relative">
                      <div className="absolute left-4 top-0 bottom-4 w-px bg-gray-500/20" />
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="relative">
                          <CornerDownRight size={12} className="absolute -left-4 top-4 text-gray-500/40" />
                          <CommentItem comment={reply} isReply />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {replyTo && (
                <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500">{t('common.replyingTo', language)} {replyTo.authorName}</p>
                  <button onClick={() => setReplyTo(null)} className="text-cyan-500 hover:text-cyan-600"><X size={14} /></button>
                </div>
              )}
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={t('common.addComment', language)}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) handleAddComment();
                    }}
                    className={`w-full pl-4 pr-12 py-4 rounded-[1.5rem] border text-sm outline-none transition-all ${theme === 'dark' ? 'bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500/50' : 'bg-white border-gray-200 text-gray-900 focus:border-cyan-600/50 shadow-inner'}`}
                  />
                  <div className="absolute right-12 top-4 text-[9px] font-black uppercase text-gray-400 hidden md:block opacity-40">Ctrl+Enter</div>
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-2 p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-xl transition-colors disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
          <div className={`relative w-full max-w-lg rounded-[3rem] border p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight uppercase">{t('common.editPost', language)}</h3>
              <button onClick={() => setIsEditing(false)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} className={`w-full p-4 rounded-2xl border font-black text-lg outline-none ${theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
              <textarea rows="4" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className={`w-full p-4 rounded-2xl border font-medium text-sm outline-none ${theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
              <button onClick={handleUpdate} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20">
                <Save size={18} className="inline mr-2" /> {t('common.saveChanges', language).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsReporting(false)}></div>
          <div className={`relative w-full max-w-md rounded-[2.5rem] border p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">{t('common.report', language)}</h3>
              <p className="text-xs font-bold text-gray-500 mt-2">{t('common.reportReason', language)}</p>
            </div>
            <div className="space-y-2 mb-8">
              {['reportInappropriate', 'reportSpam', 'reportHarassment'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full p-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all border ${reportReason === reason ? 'border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/20' : 'border-gray-500/10 hover:border-red-500/40'}`}
                >
                  {t(`common.${reason}`, language)}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsReporting(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">{t('common.cancel', language)}</button>
              <button 
                onClick={() => { alert(t('common.reportSuccess', language)); setIsReporting(false); }}
                disabled={!reportReason}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 disabled:opacity-50"
              >
                {t('auth.continue', language).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={post.image}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}
