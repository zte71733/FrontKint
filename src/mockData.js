export function getAchievementText(achievement, field, lang = 'en') {
  const value = achievement[field];
  if (typeof value === 'object' && value !== null) {
    return value[lang] || value['en'] || '';
  }
  return value || '';
}

export const MOCK_POSTS = [];
export const MOCK_USERS_LIST = [];
export const MOCK_USERS = [];
export const MOCK_CLANS = [];
export const MOCK_QUESTS = [];
export const MOCK_ACHIEVEMENTS = [];
