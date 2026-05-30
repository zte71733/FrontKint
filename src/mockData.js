export function getAchievementText(achievement, field, lang = 'en') {
  const value = achievement[field];
  if (typeof value === 'object' && value !== null) {
    return value[lang] || value['en'] || '';
  }
  return value || '';
}

export const MOCK_POSTS = [
  {
    id: 1,
    authorId: 2,
    authorName: 'Alex Runner',
    authorAvatar: '',
    title: 'Completed 10km run',
    description: 'Ran 10km in 50 minutes. New personal record!',
    category: 'sport',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: [1, 3, 4],
    comments: [
      {
        id: 1,
        authorId: 3,
        authorName: 'Sam Coder',
        authorAvatar: '',
        text: 'Amazing! Keep it up!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    points: 50
  },
  {
    id: 2,
    authorId: 3,
    authorName: 'Sam Coder',
    authorAvatar: '',
    title: 'Finished learning React',
    description: 'Completed the React course on Udemy. Built 3 projects!',
    category: 'education',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: [2, 4],
    comments: [],
    points: 75
  }
];

export const MOCK_USERS_LIST = [
  {
    id: 1,
    name: 'Your Name',
    email: 'user@example.com',
    password: 'password123',
    avatar: '',
    points: 0,
    bio: 'Gamifying my life, one achievement at a time',
    role: 'user',
    followingIds: [],
    followerIds: [],
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    name: 'Alex Runner',
    email: 'alex@example.com',
    password: 'alex123',
    avatar: '',
    points: 0,
    bio: 'Fitness enthusiast and marathon runner',
    role: 'user',
    city: 'New York',
    followingIds: [3],
    followerIds: [],
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    name: 'Sam Coder',
    email: 'sam@example.com',
    password: 'sam123',
    avatar: '',
    points: 0,
    bio: 'Full-stack developer and tech lover',
    role: 'user',
    city: 'San Francisco',
    isPrivate: true,
    followingIds: [2],
    followerIds: [2],
    lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 4,
    name: 'Admin',
    email: 'admin@kint.app',
    password: 'admin123',
    avatar: '',
    points: 0,
    bio: 'System Administrator',
    city: 'Moscow',
    isAdmin: true,
    role: 'admin',
    followingIds: [1, 2, 3],
    followerIds: [],
    lastSeen: new Date().toISOString()
  }
];

export const MOCK_USERS = MOCK_USERS_LIST;

export const MOCK_CLANS = [
  {
    id: 1,
    name: 'Alpha Achievers',
    description: 'The first and most active clan on Kint. Focused on daily discipline.',
    color: 'from-cyan-500 to-blue-600',
    ownerId: 4,
    memberIds: [4, 1, 2],
    points: 12500
  },
  {
    id: 2,
    name: 'Creative Minds',
    description: 'A community for artists, writers, and designers. We grow by creating.',
    color: 'from-purple-500 to-indigo-600',
    ownerId: 3,
    memberIds: [3, 2],
    points: 8400
  }
];

export const MOCK_QUESTS = [
  {
    id: 1,
    title: 'Daily Run',
    description: 'Go for a 30-minute run today.',
    category: 'sport',
    points: 50,
    completed: false,
    icon: 'Target',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 2,
    title: 'Code Project',
    description: 'Push 5 commits to your main project.',
    category: 'education',
    points: 100,
    completed: false,
    icon: 'Terminal',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 3,
    title: 'New Canvas',
    description: 'Start a new digital or physical painting.',
    category: 'creativity',
    points: 75,
    completed: false,
    icon: 'Palette',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
  }
];

export const MOCK_ACHIEVEMENTS = [
  {
    id: 1,
    name: { en: 'First Step', ru: 'Первый шаг', zh: '第一步' },
    description: { en: 'Post your first achievement', ru: 'Опубликуйте свое первое достижение', zh: '发布你的第一个成就' },
    category: 'creativity',
    type: 'milestone',
    target: 1,
    icon: 'Medal'
  },
  {
    id: 2,
    name: { en: 'Marathoner', ru: 'Марафонец', zh: '马拉松' },
    description: { en: 'Run a total of 42km', ru: 'Пробежать в общей сложности 42км', zh: '总共跑42公里' },
    category: 'sport',
    type: 'counter',
    target: 42,
    icon: 'Activity'
  }
];
