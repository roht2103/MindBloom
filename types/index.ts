export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sentiment?: 'Stress' | 'Anxiety' | 'Normal' | 'Depression' | 'Peaceful';
}

export interface MoodCheckin {
  id: string;
  value: number; // 1-10
  note: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  tags: string[];
  sleepHours: number;
  focusScore: number; // 1-10
  stressLevel?: number; // Calculated
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  category: 'daily' | 'weekly';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Icon name
  earned: boolean;
  earnedDate?: string;
}

export interface Post {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  reactions: {
    hugs: number;
    support: number;
    calm: number;
  };
  userReaction?: 'hugs' | 'support' | 'calm' | null;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'student' | 'professional' | 'none';
  gender?: string;
  age?: number;
  maritalStatus?: string;
  smoking?: string;
  alcohol?: string;
  intentions: string[];
  challenges: string[];
  xp: number;
  level: number;
  streak: number;
  notificationsEnabled: boolean;
}
