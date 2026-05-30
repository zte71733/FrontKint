import { useState } from 'react';
import { useTheme } from '../context/Contexts';
import { MessageSquare, MapPin } from 'lucide-react';

export default function Avatar({ user, src, alt, size = 40, className = '', showHoverCard = false }) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    'xs': 24,
    'sm': 32,
    'md': 40,
    'lg': 48,
    'xl': 64,
    '2xl': 96
  };

  const actualSize = typeof size === 'string' ? (sizeMap[size] || 40) : size;
  const avatarSrc = (user?.avatar || src);
  const avatarAlt = (user?.name || alt) || "Avatar";

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const initials = getInitials(user?.name || alt);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => showHoverCard && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center transition-transform ${className} ${!avatarSrc ? 'bg-gray-100 dark:bg-gray-900' : 'bg-gray-200 dark:bg-gray-800'}`}
        style={{ width: actualSize, height: actualSize }}
      >
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt={avatarAlt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/default-avatar.svg" 
              alt={avatarAlt} 
              className="w-full h-full object-cover"
            />
            {initials && (
              <span className="absolute font-black text-cyan-600/40" style={{ fontSize: actualSize * 0.3 }}>{initials}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover Card Popup */}
      {isHovered && user && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 rounded-[2rem] border shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${theme === 'dark' ? 'bg-gray-900 border-white/10 shadow-black' : 'bg-white border-gray-100 shadow-blue-500/10'}`}>
           <div className="flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg">
                <img src={avatarSrc} alt={avatarAlt} className="w-full h-full object-cover" />
             </div>
             <h4 className="font-black text-sm uppercase tracking-tight mb-1">{user.name}</h4>
             <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin size={10} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{user.city || 'Kint User'}</span>
             </div>
             <div className="w-full grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-gray-500/5 border border-white/5">
                   <p className="text-xs font-black text-cyan-500">{user.level || 1}</p>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Level</p>
                </div>
                <div className="p-2 rounded-xl bg-gray-500/5 border border-white/5">
                   <p className="text-xs font-black text-purple-500">{user.followers || 0}</p>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Followers</p>
                </div>
             </div>
             <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-cyan-500">
                <MessageSquare size={12} />
                Send Message
             </div>
           </div>
           <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${theme === 'dark' ? 'border-t-gray-900' : 'border-t-white'}`} />
        </div>
      )}
    </div>
  );
}
