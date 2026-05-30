import { useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import Avatar from '../components/Avatar';

export default function Leaderboard() {
  const { users, calculateLevel } = useData();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-6`}>{t('common.leaderboard', language)}</h1>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} rounded-lg shadow-md border overflow-hidden`}>
        {sortedUsers.map((user, index) => (
          <div key={user.id} className={`flex items-center gap-4 p-4 ${index !== sortedUsers.length - 1 ? (theme === 'dark' ? 'border-gray-700' : 'border-gray-200') + ' border-b' : ''} ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
            <span className={`text-2xl font-bold w-8 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {index + 1}
            </span>
            <Avatar src={user.avatar} alt={user.name} size={48} className="rounded-full" />
            <div className="flex-1">
              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>{user.name}</p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('common.level', language)} {calculateLevel(user.points)}</p>
            </div>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">{user.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
