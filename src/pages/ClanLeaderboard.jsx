import { useData, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';

export default function ClanLeaderboard() {
  const { clans } = useData();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const sortedClans = [...clans].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-6`}>{t('common.clanLeaderboard', language)}</h1>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} rounded-lg shadow-md border overflow-hidden`}>
        {sortedClans.map((clan, index) => (
          <div key={clan.id} className={`flex items-center gap-4 p-4 ${index !== sortedClans.length - 1 ? (theme === 'dark' ? 'border-gray-700' : 'border-gray-200') + ' border-b' : ''} ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
            <span className={`text-2xl font-bold w-8 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {index + 1}
            </span>
            <div className={`w-12 h-12 bg-gradient-to-r ${clan.color} rounded-lg`}></div>
            <div className="flex-1">
              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>{clan.name}</p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{clan.members} {t('common.members', language)}</p>
            </div>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">{clan.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
