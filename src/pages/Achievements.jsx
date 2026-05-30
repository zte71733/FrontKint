import { useData, useTheme, useLanguage, useAuth } from '../context/Contexts';
import { getAchievementText } from '../mockData';
import { t } from '../i18n/translations';
import Icon from '../components/Icon';
import { Lock } from 'lucide-react';

export default function Achievements() {
  const { achievements, users } = useData();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const user = users.find(u => u.id === currentUser?.id) || users[0];
  const unlockedIds = user?.unlockedAchievements || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-6`}>{t('common.achievements', language)}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`p-6 rounded-lg border-2 transition ${isUnlocked
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 opacity-50'
                  : 'border-gray-300 bg-gray-50 opacity-50'}`}
            >
              <div className="text-4xl mb-3">
                {isUnlocked ? (
                  <Icon name={achievement.icon || 'Star'} size={40} className="text-yellow-500" />
                ) : (
                  <Lock size={40} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                )}
              </div>
              <h3 className={`${isUnlocked ? 'text-gray-900' : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} font-bold text-lg`}>{getAchievementText(achievement, 'name', language)}</h3>
              <p className={`${isUnlocked ? 'text-gray-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>{getAchievementText(achievement, 'description', language)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
